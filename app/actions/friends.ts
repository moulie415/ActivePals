import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {upUnreadCount, fetchUsers} from './home';
import Profile, {UserState} from '../types/Profile';
import {fetchOther} from './profile';
import {MyThunkDispatch, MyThunkResult} from '../types/Shared';

export const SET_FRIENDS = 'SET_FRIENDS';
export const SET_FRIEND = 'SET_FRIEND';
export const ADD_FRIEND = 'ADD_FRIEND';
export const UPDATE_FRIEND_STATE = 'UPDATE_FRIEND_STATE';
export const SET_MODAL = 'SET_MODAL';

const setFriends = (friends) => ({
  type: SET_FRIENDS,
  friends,
});

const setFriend = (friend) => ({
  type: SET_FRIEND,
  friend,
});

const addToFriends = (uid: string, friend) => ({
  type: ADD_FRIEND,
  uid,
  friend,
});

export const updateFriendState = (uid: string, state: UserState) => ({
  type: UPDATE_FRIEND_STATE,
  uid,
  state,
});

export const SetModal = (open: boolean) => ({
  type: SET_MODAL,
  open,
});

export const removeFriend = (uid: string): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    const {friends}: {[key: string]: Profile} = getState().friends;
    const friendArr = Object.values(friends).filter(
      (friend) => friend.uid !== uid,
    );
    const obj = friendArr.reduce((acc, cur, i) => {
      acc[cur.uid] = cur;
      return acc;
    }, {});
    dispatch(setFriends(obj));
  };
};

const getStateString = (state: UserState) => {
  if (state && state !== UserState.AWAY) {
    return UserState.ONLINE;
  }
  if (!state) {
    return UserState.OFFLINE;
  }
  return UserState.AWAY;
};

export const fetchFriends = (
  uid: string,
  limit = 10,
  startAt?: string,
): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    const ref = database().ref('userFriends').child(uid).limitToLast(limit);
    await ref.on('value', async (snapshot) => {
      if (snapshot.val()) {
        const {friends} = getState().friends;
        Object.keys(friends).forEach((friend) => {
          if (!snapshot.val()[friend]) {
            dispatch(removeFriend(friend));
          }
        });
        const uids = Object.keys(snapshot.val());
        await Promise.all(
          uids.map((friendUid) => {
            return new Promise((resolve) => {
              const status = snapshot.val()[friendUid];
              database()
                .ref('users')
                .child(friendUid)
                .on('value', async (profile) => {
                  if (profile.val()) {
                    const {state} = profile.val();
                    const userState = getStateString(state);
                    dispatch(
                      setFriend({...profile.val(), state: userState, status}),
                    );
                    resolve();
                  }
                });
            });
          }),
        );
        dispatch(fetchOther(uid));
      } else {
        dispatch(setFriends({}));
        dispatch(fetchOther(uid));
      }
    });
  };
};

export const sendRequest = (
  friendUid: string,
): MyThunkResult<Promise<void>> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    const {uid} = getState().profile.profile;
    const promise1 = database()
      .ref(`userFriends/${uid}`)
      .child(friendUid)
      .set('outgoing');
    const promise2 = database()
      .ref(`userFriends/${friendUid}`)
      .child(uid)
      .set('incoming');
    await Promise.all([promise1, promise2]);
    const date = new Date().toString();
    const ref = database().ref('notifications').push();
    const {key} = ref;
    await ref.set({date, uid, type: 'friendRequest'});
    database().ref(`userNotifications/${friendUid}`).child(key).set(true);
    upUnreadCount(friendUid);
  };
};

export const acceptRequest = (uid: string, friendUid: string) => {
  return () => {
    const promise1 = database()
      .ref(`userFriends/${uid}`)
      .child(friendUid)
      .set('connected');
    const promise2 = database()
      .ref(`userFriends/${friendUid}`)
      .child(uid)
      .set('connected');
    return Promise.all([promise1, promise2]);
  };
};

export const deleteFriend = (uid: string): MyThunkResult<Promise<void>> => {
  return (dispatch: MyThunkDispatch, getState) => {
    const you = getState().profile.profile.uid;
    dispatch(removeFriend(uid));
    return database().ref(`userFriends/${you}`).child(uid).remove();
  };
};

export const fetchFbFriends = (token: string) => {
  return async (dispatch: MyThunkDispatch) => {
    const response = await fetch(
      `https://graph.facebook.com/v5.0/me?fields=friends&access_token=${token}`,
    );
    const json = await response.json();
    if (json.friends && json.friends.data) {
      const uids: string[] = await Promise.all(
        json.friends.data.map(async (friend) => {
          const snapshot = await database()
            .ref('fbusers')
            .child(friend.id)
            .once('value');
          return snapshot.val();
        }),
      );
      const validUids = uids.filter((uid) => uid !== null);
      return dispatch(fetchUsers(validUids)) || {};
    }
    return {};
  };
};
