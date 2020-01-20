import firebase from 'react-native-firebase';
import { fetchFriends } from './friends';
import { fetchSessionChats, fetchChats, fetchGymChat, setGymChat, getUnreadCount } from './chats';
import { fetchPosts } from './home';
import { fetchSessions, fetchPhotoPath } from './sessions';
import { navigateLogin, navigateHome, navigateWelcome } from './navigation';
import { UserState } from '../types/Profile';

export const SET_PROFILE = 'SET_PROFILE';
export const SET_LOGGED_IN = 'SET_LOGGED_IN';
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT';
export const SET_GYM = 'SET_GYM';
export const REMOVE_GYM = 'REMOVE_GYM';
export const SET_LOCATION = 'SET_LOCATION';
export const SET_HAS_VIEWED_WELCOME = 'SET_HAS_VIEWED_WELCOME';
export const SET_ENV_VARS = 'SET_ENV_VARS';

const setProfile = profile => ({
  type: SET_PROFILE,
  profile,
});

export const setHasLoggedIn = loggedIn => ({
  type: SET_LOGGED_IN,
  loggedIn,
});

export const setLoggedOut = () => ({
  type: SET_LOGGED_OUT,
});

export const setGym = gym => ({
  type: SET_GYM,
  gym,
});

export const resetGym = () => ({
  type: REMOVE_GYM,
});

export const setLocation = location => ({
  type: SET_LOCATION,
  location,
});

export const setHasViewedWelcome = () => ({
  type: SET_HAS_VIEWED_WELCOME,
});

const setupPresence = uid => {
  const ref = firebase
    .database()
    .ref(`users/${uid}`)
    .child('state');
  const connectedRef = firebase.database().ref('.info/connected');
  connectedRef.on('value', snap => {
    if (snap.val() === true) {
      ref.onDisconnect().remove();
      ref.set(UserState.ONLINE);
    }
  });
};

const fetchGym = async (profile, dispatch) => {
  if (profile.gym) {
    const snapshot = await firebase
      .database()
      .ref(`gyms/${profile.gym}`)
      .once('value');
    const gym = await fetchPhotoPath(snapshot.val());
    dispatch(setGym(gym));
  }
};

export const fetchProfile = () => {
  return async dispatch => {
    const user = firebase.auth().currentUser;
    const envVar = await firebase
      .database()
      .ref('ENV_VARS')
      .child('GOOGLE_API_KEY')
      .once('value');
    const GOOGLE_API_KEY = envVar.val();
    process.env.GOOGLE_API_KEY = GOOGLE_API_KEY;
    const snapshot = await firebase
      .database()
      .ref(`users/${user.uid}`)
      .once('value');
    try {
      const url = await firebase
        .storage()
        .ref(`images/${user.uid}`)
        .child('avatar')
        .getDownloadURL();
      dispatch(setProfile({ ...snapshot.val(), avatar: url }));
      fetchGym(snapshot.val(), dispatch);
      return { ...snapshot.val(), avatar: url };
    } catch (e) {
      dispatch(setProfile(snapshot.val()));
      fetchGym(snapshot.val(), dispatch);
      return snapshot.val();
    }
  };
};

export const doSetup = profile => {
  return async (dispatch, getState) => {
    const { uid } = profile;
    setupPresence(uid);
    try {
      const fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        firebase
          .database()
          .ref(`users/${uid}`)
          .child('FCMToken')
          .set(fcmToken);
        console.log(fcmToken);
      } else {
        console.warn('no token');
      }
    } catch (e) {
      console.warn(e);
    }
    if (getState().nav.index === 0) {
      if (getState().profile.hasViewedWelcome) {
        dispatch(navigateHome());
      } else {
        dispatch(navigateWelcome());
      }
    }
    dispatch(setHasLoggedIn(true));
    dispatch(getUnreadCount(uid));
    await dispatch(fetchFriends(uid));
    dispatch(fetchSessionChats(uid));
    dispatch(fetchChats(uid));
    profile.gym && dispatch(fetchGymChat(profile.gym));
    dispatch(fetchPosts(uid));
    dispatch(fetchSessions());
  };
};

export const removeUser = () => {
  return async dispatch => {
    const user = firebase.auth().currentUser;
    dispatch(setLoggedOut());
    await user.delete();
    dispatch(navigateLogin());
  };
};

export const removeGym = () => {
  return async (dispatch, getState) => {
    const currentGym = getState().profile.gym.place_id;
    const { uid } = getState().profile.profile;
    firebase
      .database()
      .ref(`users/${uid}`)
      .child('gym')
      .set(null);
    const gym = await firebase
      .database()
      .ref('gyms')
      .child(currentGym)
      .once('value');
    const count = gym.val().userCount - 1;
    firebase
      .database()
      .ref(`gyms/${currentGym}`)
      .child('userCount')
      .set(count);
    firebase
      .database()
      .ref(`gyms/${currentGym}/users`)
      .child(uid)
      .remove();
    dispatch(resetGym());
    dispatch(setGymChat(null));
  };
};

export const joinGym = location => {
  return async (dispatch, getState) => {
    const { uid } = getState().profile.profile;
    if (getState().profile.gym) {
      dispatch(removeGym());
    }
    firebase
      .database()
      .ref(`users/${uid}`)
      .child('gym')
      .set(location.place_id);
    const gym = await firebase
      .database()
      .ref('gyms')
      .child(location.place_id)
      .once('value');
    if (!gym.val()) {
      location.users = { [uid]: true };
      location.userCount = 1;
      firebase
        .database()
        .ref('gyms')
        .child(location.place_id)
        .set(location);
      const systemMessage = {
        _id: 1,
        text: 'Beginning of chat',
        createdAt: new Date().toString(),
        system: true,
      };
      await firebase
        .database()
        .ref(`gymChats/${location.place_id}`)
        .push(systemMessage);
      dispatch(fetchGymChat(location.place_id));
    } else {
      const count = gym.val().userCount ? gym.val().userCount + 1 : 1;
      firebase
        .database()
        .ref(`gyms/${gym.val().place_id}`)
        .child('userCount')
        .set(count);
      firebase
        .database()
        .ref(`gyms/${gym.val().place_id}/users`)
        .child(uid)
        .set(true);
      dispatch(fetchGymChat(location.place_id));
    }
    dispatch(setGym(location));
  };
};
