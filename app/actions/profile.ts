import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {fetchFriends} from './friends';
import {
  fetchSessionChats,
  fetchChats,
  fetchGymChat,
  setGymChat,
  getUnreadCount,
} from './chats';
import {fetchPosts, SetNotificationCountAction} from './home';
import {fetchSessions, fetchPhotoPath, fetchPrivateSessions} from './sessions';
import Profile, {UserState} from '../types/Profile';
import Place from '../types/Place';
import {MyThunkDispatch, MyThunkResult} from '../types/Shared';
import {createChannels} from '../helpers/notifications';
import {YourLocation} from '../types/Location';

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

interface SetLoggedOutAction {
  type: typeof SET_LOGGED_OUT;
}

interface ViewedWelcomeAction {
  type: typeof SET_HAS_VIEWED_WELCOME;
}

interface SetLocationAction {
  type: typeof SET_LOCATION;
  location: YourLocation;
}

interface SetGymAction {
  type: typeof SET_GYM;
  gym: Place;
}

interface ResetGymAction {
  type: typeof REMOVE_GYM;
}

interface SetLoggedInAction {
  type: typeof SET_LOGGED_IN;
}

export type ProfileActionTypes =
  | SetProfileAction
  | SetLoggedOutAction
  | SetLoggedInAction
  | ViewedWelcomeAction
  | SetGymAction
  | ResetGymAction
  | SetLocationAction
  | SetNotificationCountAction;

export const SetProfile = (profile: {
  [key: string]: any;
}): SetProfileAction => ({
  type: SET_PROFILE,
  profile,
});

export const ViewedWelcome = (): ViewedWelcomeAction => ({
  type: SET_HAS_VIEWED_WELCOME,
});

export const setLoggedOut = (): SetLoggedOutAction => ({
  type: SET_LOGGED_OUT,
});

export const setLoggedIn = (): SetLoggedInAction => ({
  type: SET_LOGGED_IN,
});

export const setGym = (gym: Place): SetGymAction => ({
  type: SET_GYM,
  gym,
});

export const resetGym = (): ResetGymAction => ({
  type: REMOVE_GYM,
});

export const setLocation = (location: YourLocation): SetLocationAction => ({
  type: SET_LOCATION,
  location,
});

export const setHasViewedWelcome = (): ViewedWelcomeAction => ({
  type: SET_HAS_VIEWED_WELCOME,
});

export const doSetup = (): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    //const {uid} = profile;
    const {uid, gym} = getState().profile.profile;
    setupPresence(uid);
    await messaging().requestPermission();
    const token = await messaging().getToken();
    if (token) {
      await database().ref('users').child(uid).update({FCMToken: token});
    }
    createChannels();
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
        dispatch(SetProfile(snapshot.val()));
        dispatch(fetchGym(snapshot.val()));
        return snapshot.val();
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
