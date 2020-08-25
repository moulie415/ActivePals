import db from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import {fetchFriends} from './friends';
import {
  fetchSessionChats,
  fetchChats,
  fetchGymChat,
  setGymChat,
  getUnreadCount,
} from './chats';
import {fetchPosts} from './home';
import {fetchSessions, fetchPhotoPath, fetchPrivateSessions} from './sessions';
import Profile, {UserState} from '../types/Profile';
import Place from '../types/Place';
import {MyThunkDispatch, MyThunkResult, Theme} from '../types/Shared';

export const SET_PROFILE = 'SET_PROFILE';
export const SET_LOGGED_IN = 'SET_LOGGED_IN';
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT';
export const SET_GYM = 'SET_GYM';
export const REMOVE_GYM = 'REMOVE_GYM';
export const SET_LOCATION = 'SET_LOCATION';
export const SET_HAS_VIEWED_WELCOME = 'SET_HAS_VIEWED_WELCOME';

interface SetProfileAction {
  type: typeof SET_PROFILE;
  profile: {[key: string]: any};
}

interface SetLoggedOutOutAction {
  type: typeof SET_LOGGED_OUT;
}

interface ViewedWelcomeAction {
  type: typeof SET_HAS_VIEWED_WELCOME;
}

export type ProfileActionTypes =
  | SetProfileAction
  | SetLoggedOutOutAction
  | ViewedWelcomeAction;

export const SetProfile = (profile: {
  [key: string]: any;
}): SetProfileAction => ({
  type: SET_PROFILE,
  profile,
});

export const SetLoggedOut = (): SetLoggedOutOutAction => ({
  type: SET_LOGGED_OUT,
});

export const ViewedWelcome = (): ViewedWelcomeAction => ({
  type: SET_HAS_VIEWED_WELCOME,
});

export const setHasLoggedIn = (loggedIn) => ({
  type: SET_LOGGED_IN,
  loggedIn,
});

export const setLoggedOut = () => ({
  type: SET_LOGGED_OUT,
});

export const setGym = (gym) => ({
  type: SET_GYM,
  gym,
});

export const resetGym = () => ({
  type: REMOVE_GYM,
});

export const setLocation = (location) => ({
  type: SET_LOCATION,
  location,
});

export const setHasViewedWelcome = () => ({
  type: SET_HAS_VIEWED_WELCOME,
});

export const doSetup = (): MyThunkResult<Promise<void>> => {
  return async (dispatch, getState) => {
    //const {uid} = profile;
    const {uid, gym} = getState().profile.profile;
    try {
      setupPresence(uid);

      //   const fcmToken = await messaging().getToken();
      //   if (fcmToken) {
      //     database()
      //       .ref(`users/${uid}`)
      //       .child('FCMToken')
      //       .set(fcmToken);
      //     console.log(fcmToken);
      //   } else {
      //     console.warn('no token');
      //   }
    } catch (e) {
      console.warn(e);
    }
    dispatch(getUnreadCount(uid));

    dispatch(fetchFriends(uid));

    gym && dispatch(fetchGymChat(gym));
  };
};

const setupPresence = (uid: string) => {
  const ref = database().ref(`users/${uid}`).child('state');
  const lastChange = database().ref(`users/${uid}`).child('lastChange');
  const connectedRef = database().ref('.info/connected');
  connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
      ref.onDisconnect().remove();
      lastChange.onDisconnect().set(database.ServerValue.TIMESTAMP);
      ref.set(UserState.ONLINE);
    }
  });
};

const fetchGym = (profile: Profile): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    if (profile.gym) {
      const snapshot = await database()
        .ref(`gyms/${profile.gym}`)
        .once('value');
      const gym = await fetchPhotoPath(snapshot.val());
      dispatch(setGym(gym));
    }
  };
};

export const fetchProfile = () => {
  return async (dispatch: MyThunkDispatch) => {
    const user = auth().currentUser;
    if (user) {
      const snapshot = await database().ref(`users/${user.uid}`).once('value');
      try {
        const url = await storage()
          .ref(`images/${user.uid}`)
          .child('avatar')
          .getDownloadURL();
        dispatch(SetProfile({...snapshot.val(), avatar: url}));
        dispatch(fetchGym(snapshot.val()));
        return {...snapshot.val(), avatar: url};
      } catch (e) {
        dispatch(SetProfile(snapshot.val()));
        dispatch(fetchGym(snapshot.val()));
        return snapshot.val();
      }
    }
  };
};

export const fetchOther = (uid: string) => {
  return (dispatch: MyThunkDispatch) => {
    dispatch(fetchPrivateSessions());
    dispatch(fetchPosts(uid));
    dispatch(fetchSessions());
    dispatch(fetchSessionChats(uid));
    dispatch(fetchChats(uid));
  };
};

export const removeUser = (): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch) => {
    const user = auth().currentUser;
    dispatch(setLoggedOut());
    await user?.delete();
  };
};

export const removeGym = (): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    const currentGym = getState().profile.gym.place_id;
    const {uid} = getState().profile.profile;
    database().ref(`users/${uid}`).child('gym').set(null);
    const gym = await database().ref('gyms').child(currentGym).once('value');
    const count = gym.val().userCount - 1;
    database().ref(`gyms/${currentGym}`).child('userCount').set(count);
    database().ref(`gyms/${currentGym}/users`).child(uid).remove();
    dispatch(resetGym());
    dispatch(setGymChat(null));
  };
};

export const joinGym = (location: Place): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    const {uid} = getState().profile.profile;
    if (getState().profile.gym) {
      dispatch(removeGym());
    }
    database().ref(`users/${uid}`).child('gym').set(location.place_id);
    const gym = await database()
      .ref('gyms')
      .child(location.place_id)
      .once('value');
    if (!gym.val()) {
      location.users = {[uid]: true};
      location.userCount = 1;
      database().ref('gyms').child(location.place_id).set(location);
      const systemMessage = {
        _id: 1,
        text: 'Beginning of chat',
        createdAt: new Date().toString(),
        system: true,
      };
      await database().ref(`gymChats/${location.place_id}`).push(systemMessage);
      dispatch(fetchGymChat(location.place_id));
    } else {
      const count = gym.val().userCount ? gym.val().userCount + 1 : 1;
      database()
        .ref(`gyms/${gym.val().place_id}`)
        .child('userCount')
        .set(count);
      database().ref(`gyms/${gym.val().place_id}/users`).child(uid).set(true);
      dispatch(fetchGymChat(location.place_id));
    }
    dispatch(setGym(location));
  };
};
