import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import {getAvatar} from '../helpers/images';
import Message, {MessageType} from '../types/Message';
import {
  MyThunkDispatch,
  MyThunkResult,
  PushNotificationData,
} from '../types/Shared';
export const SET_SESSION_CHATS = 'SET_SESSION_CHATS';
export const ADD_SESSION_CHAT = 'ADD_SESSION_CHAT';
export const SET_CHATS = 'SET_CHATS';
export const ADD_CHAT = 'ADD_CHAT';
export const SET_MESSAGE_SESSION = 'SET_MESSAGE_SESSION';
export const NEW_NOTIF = 'NEW_NOTIF';
export const RESET_NOTIFICATION = 'RESET_NOTIFICATION';
export const UPDATE_CHAT = 'UPDATE_CHAT';
export const UPDATE_SESSION_CHAT = 'UPDATE_SESSION_CHAT';
export const SET_GYM_CHAT = 'SET_GYM_CHAT';
export const SET_MESSAGE = 'SET_MESSAGE';
export const RESET_MESSAGE = 'RESET_MESSAGE';
export const SET_UNREAD_COUNT = 'SET_UNREAD_COUNT';
export const MUTE_CHAT = 'MUTE_CHAT';

const setSessionChats = (sessionChats) => ({
  type: SET_SESSION_CHATS,
  sessionChats,
});

const setChats = (chats) => ({
  type: SET_CHATS,
  chats,
});

const setMessageSession = (id: string, messages: {[key: string]: Message}) => ({
  type: SET_MESSAGE_SESSION,
  id,
  messages,
});

const updateChat = (id: string, lastMessage) => ({
  type: UPDATE_CHAT,
  id,
  lastMessage,
});

const updateSessionChat = (key: string, lastMessage) => ({
  type: UPDATE_SESSION_CHAT,
  key,
  lastMessage,
});

const setMute = (id: string, mute: boolean) => ({
  type: MUTE_CHAT,
  id,
  mute,
});

export const setGymChat = (chat) => ({
  type: SET_GYM_CHAT,
  chat,
});

export const newNotification = (notif) => ({
  type: NEW_NOTIF,
  notif,
});

export const resetNotification = () => ({
  type: RESET_NOTIFICATION,
});

export const setMessage = (url: string, text: string) => ({
  type: SET_MESSAGE,
  url,
  text,
});

export const resetMessage = () => ({
  type: RESET_MESSAGE,
});

export const setUnreadCount = ({id, count}: {id: string; count: number}) => ({
  type: SET_UNREAD_COUNT,
  id,
  count,
});

export const fetchGymChat = (gym: string): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    return database()
      .ref('gymChats')
      .child(gym)
      .orderByKey()
      .limitToLast(1)
      .on('value', (lastMessage) => {
        if (lastMessage.val()) {
          const key = Object.keys(lastMessage.val())[0];
          const message = lastMessage.val()[key];
          const avatar = getAvatar(message, getState());
          
          const chat = {
            lastMessage: {...message, user: {...message.user, avatar}, key},
            key: gym,
          };
          dispatch(setGymChat(chat));
        } else {
          dispatch(setGymChat(null));
        }
      });
  };
};

export const updateLastMessage = (
  notif: PushNotificationData,
): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    if (notif.type === MessageType.MESSAGE && notif.chatId) {
      return database()
        .ref('chats')
        .child(notif.chatId)
        .orderByKey()
        .limitToLast(1)
        .once('value', (lastMessage) => {
          if (lastMessage.val()) {
            const key = Object.keys(lastMessage.val())[0];
            const message = lastMessage.val()[key];
            const avatar = getAvatar(message, getState());
            dispatch(
              updateChat(notif.uid || notif.friendUid, {
                ...message,
                user: {...message.user, avatar},
                key,
              }),
            );
          }
        });
    }
    if (notif.type === MessageType.SESSION_MESSAGE && notif.sessionId) {
      return database()
        .ref('sessionChats')
        .child(notif.sessionId)
        .orderByKey()
        .limitToLast(1)
        .once('value', (lastMessage) => {
          if (lastMessage.val()) {
            const key = Object.keys(lastMessage.val())[0];
            const message = lastMessage.val()[key];
            const avatar = getAvatar(message, getState());

            dispatch(
              updateSessionChat(notif.sessionId, {
                ...message,
                user: {...message.user, avatar},
                key,
              }),
            );
          }
        });
    }
    if (notif.type === MessageType.GYM_MESSAGE && notif.gymId) {
      dispatch(fetchGymChat(notif.gymId));
    }
  };
};

export const resetUnreadCount = (id: string): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    const count = 0;
    const {uid} = getState().profile.profile;
    database().ref(`unreadCount/${uid}`).child(id).set(count);
    dispatch(setUnreadCount({id, count}));
  };
};

export const getUnreadCount = (uid: string) => {
  return (dispatch: MyThunkDispatch) => {
    database()
      .ref('unreadCount')
      .child(uid)
      .on('value', (snapshot) => {
        if (snapshot.val()) {
          Object.keys(snapshot.val()).forEach((id) => {
            const count = snapshot.val()[id];
            if (count !== 0) {
              dispatch(setUnreadCount({id, count}));
            } else if (count !== 0) {
              dispatch(resetUnreadCount(id));
            }
          });
        }
      });
  };
};

export const fetchChats = (uid: string, limit = 10): MyThunkResult<void> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    return database()
      .ref('userChats')
      .child(uid)
      .limitToFirst(limit)
      .on('value', async (snapshot) => {
        if (snapshot.val()) {
          const chats = await Promise.all(
            Object.keys(snapshot.val()).map(async (chat) => {
              const chatId = snapshot.val()[chat];
              const lastMessage = await database()
                .ref('chats')
                .child(chatId)
                .orderByKey()
                .limitToLast(1)
                .once('value');
              let message = {text: 'Beginning of chat'};
              if (lastMessage.val()) {
                const key = Object.keys(lastMessage.val())[0];
                const avatar = getAvatar(lastMessage.val(), getState());
                message = {
                  ...lastMessage.val()[key],
                  user: {...lastMessage.val(), avatar},
                  key,
                };
              }
              return {uid: chat, chatId, lastMessage: message, key: chatId};
            }),
          );
          const obj = chats.reduce((acc, cur) => {
            acc[cur.uid] = cur;
            return acc;
          }, {});
          dispatch(setChats(obj));
        } else {
          dispatch(setChats({}));
        }
      });
  };
};

export const fetchSessionChats = (
  uid: string,
  limit = 10,
): MyThunkResult<void> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    return database()
      .ref('userSessions')
      .child(uid)
      .limitToFirst(limit)
      .on('value', async (userSessions) => {
        if (userSessions.val()) {
          const chats = await Promise.all(
            Object.keys(userSessions.val()).map(async (session) => {
              const type =
                userSessions.val()[session] === 'private'
                  ? 'privateSessions'
                  : 'sessions';
              const snapshot = await database()
                .ref(`${type}/${session}`)
                .once('value');
              const lastMessage = await database()
                .ref('sessionChats')
                .child(session)
                .orderByKey()
                .limitToLast(1)
                .once('value');
              let message = {text: 'Beginning of chat'};
              if (lastMessage.val()) {
                const key = Object.keys(lastMessage.val())[0];
                const avatar = getAvatar(lastMessage.val(), getState());
                message = {
                  ...lastMessage.val()[key],
                  user: {...lastMessage.val(), avatar},
                  key,
                };
              }
              return {...snapshot.val(), key: session, lastMessage: message};
            }),
          );
          const obj = chats.reduce((acc, cur) => {
            acc[cur.key] = cur;
            return acc;
          }, {});
          dispatch(setSessionChats(obj));
        } else {
          dispatch(setSessionChats({}));
        }
      });
  };
};

export const fetchMessages = (
  id: string,
  amount: number,
  uid: string,
  endAt?: string,
): MyThunkResult<void> => {
  return async (dispatch: MyThunkDispatch, getState) => {
    const ref = endAt
      ? database()
          .ref(`chats/${id}`)
          .orderByKey()
          .endAt(endAt)
          .limitToLast(amount)
      : database().ref(`chats/${id}`).orderByKey().limitToLast(amount);
    const snapshot = await ref.once('value');
    const messages = {};
    snapshot.forEach((child) => {
      const avatar = getAvatar(child.val(), getState());
      messages[child.key] = {
        ...child.val(),
        key: child.key,
        createdAt: new Date(child.val().createdAt),
        user: {...child.val().user, avatar},
      };
    });
    dispatch(setMessageSession(id, messages));
  };
};

export const fetchSessionMessages = (
  id: string,
  amount: number,
  isPrivate = false,
  endAt?: string,
): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    const type = isPrivate ? 'privateSessions' : 'sessions';
    const ref = endAt
      ? database()
          .ref('sessionChats/' + id)
          .endAt(endAt)
          .limitToLast(amount)
      : database()
          .ref('sessionChats/' + id)
          .limitToLast(amount);
    return ref.once('value', (snapshot) => {
      const messages = {};
      snapshot.forEach((child) => {
        const avatar = getAvatar(child.val(), getState());
        messages[child.key] = {
          ...child.val(),
          key: child.key,
          createdAt: new Date(child.val().createdAt),
          user: {...child.val().user, avatar},
        };

        return false;
      });
      dispatch(setMessageSession(id, messages));
    });
  };
};

export const fetchGymMessages = (id: string, amount: number, endAt?: string) => {
  return (dispatch: MyThunkDispatch, getState) => {
    const ref = endAt
      ? database().ref(`gymChats/${id}`).endAt(endAt).limitToLast(amount)
      : database().ref(`gymChats/${id}`).limitToLast(amount);
    return ref.once('value', (snapshot) => {
      const messages = {};
      snapshot.forEach((child) => {
        const avatar = getAvatar(child.val(), getState());
        messages[child.key] = {
          ...child.val(),
          key: child.key,
          createdAt: new Date(child.val().createdAt),
          user: {...child.val().user, avatar},
        };

        return false;
      });
      dispatch(setMessageSession(id, messages));
    });
  };
};

export const muteChat = (id: string, mute: boolean): MyThunkResult<void> => {
  return (dispatch: MyThunkDispatch, getState) => {
    const {uid} = getState().profile.profile;
    dispatch(setMute(id, mute));
    database().ref(`muted/${uid}`).child(id).set(mute);
  };
};
