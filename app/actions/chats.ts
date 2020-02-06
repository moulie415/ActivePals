import firebase from 'react-native-firebase';
import { MessageType } from '../types/Message';

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

const setSessionChats = sessionChats => ({
  type: SET_SESSION_CHATS,
  sessionChats,
});

const setChats = chats => ({
  type: SET_CHATS,
  chats,
});

const setMessageSession = (id, messages) => ({
  type: SET_MESSAGE_SESSION,
  id,
  messages,
});

const updateChat = (id, lastMessage) => ({
  type: UPDATE_CHAT,
  id,
  lastMessage,
});

const updateSessionChat = (key, lastMessage) => ({
  type: UPDATE_SESSION_CHAT,
  key,
  lastMessage,
});

const setMute = (id, mute) => ({
  type: MUTE_CHAT,
  id,
  mute,
});

export const setGymChat = chat => ({
  type: SET_GYM_CHAT,
  chat,
});

export const newNotification = notif => ({
  type: NEW_NOTIF,
  notif,
});

export const resetNotification = () => ({
  type: RESET_NOTIFICATION,
});

export const setMessage = (url, text) => ({
  type: SET_MESSAGE,
  url,
  text,
});

export const resetMessage = () => ({
  type: RESET_MESSAGE,
});

export const setUnreadCount = ({ id, count }) => ({
  type: SET_UNREAD_COUNT,
  id,
  count,
});

export const fetchGymChat = gym => {
  return dispatch => {
    return firebase
      .database()
      .ref('gymChats')
      .child(gym)
      .orderByKey()
      .limitToLast(1)
      .on('value', lastMessage => {
        if (lastMessage.val()) {
          const key = Object.keys(lastMessage.val())[0];
          const message = lastMessage.val()[key];
          const chat = { lastMessage: { ...message, key }, key: gym };
          dispatch(setGymChat(chat));
        } else {
          dispatch(setGymChat(null));
        }
      });
  };
};

export const updateLastMessage = notif => {
  return dispatch => {
    if (notif.type === MessageType.MESSAGE) {
      return firebase
        .database()
        .ref('chats')
        .child(notif.chatId)
        .orderByKey()
        .limitToLast(1)
        .once('value', lastMessage => {
          if (lastMessage.val()) {
            const key = Object.keys(lastMessage.val())[0];
            const message = lastMessage.val()[key];
            dispatch(updateChat(notif.uid || notif.friendUid, { ...message, key }));
          }
        });
    }
    if (notif.type === MessageType.SESSION_MESSAGE) {
      return firebase
        .database()
        .ref('sessionChats')
        .child(notif.sessionId)
        .orderByKey()
        .limitToLast(1)
        .once('value', lastMessage => {
          if (lastMessage.val()) {
            const key = Object.keys(lastMessage.val())[0];
            const message = lastMessage.val()[key];

            dispatch(updateSessionChat(notif.sessionId, { ...message, key }));
          }
        });
    }
    if (notif.type === MessageType.GYM_MESSAGE) {
      dispatch(fetchGymChat(notif.gymId));
    }
  };
};

export const resetUnreadCount = id => {
  return (dispatch, getState) => {
    const count = 0;
    const { uid } = getState().profile.profile;
    firebase
      .database()
      .ref(`unreadCount/${uid}`)
      .child(id)
      .set(count);
    dispatch(setUnreadCount({ id, count }));
  };
};

export const getUnreadCount = uid => {
  return (dispatch, getState) => {
    firebase
      .database()
      .ref('unreadCount')
      .child(uid)
      .on('value', snapshot => {
        if (snapshot.val()) {
          Object.keys(snapshot.val()).forEach(id => {
            const count = snapshot.val()[id];
            if (count !== 0) {
              dispatch(setUnreadCount({ id, count }));
            } else if (count !== 0) {
              dispatch(resetUnreadCount(id));
            }
          });
        }
      });
  };
};

export const fetchChats = (uid, limit = 10) => {
  return async dispatch => {
    return firebase
      .database()
      .ref('userChats')
      .child(uid)
      .limitToFirst(limit)
      .on('value', async snapshot => {
        if (snapshot.val()) {
          const chats = await Promise.all(
            Object.keys(snapshot.val()).map(async chat => {
              const chatId = snapshot.val()[chat];
              const lastMessage = await firebase
                .database()
                .ref('chats')
                .child(chatId)
                .orderByKey()
                .limitToLast(1)
                .once('value');
              let message = { text: 'Beginning of chat' };
              if (lastMessage.val()) {
                const key = Object.keys(lastMessage.val())[0];
                message = { ...lastMessage.val()[key], key };
              }
              return { uid: chat, chatId, lastMessage: message, key: chatId };
            })
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

export const fetchSessionChats = (uid, limit = 10) => {
  return async dispatch => {
    return firebase
      .database()
      .ref('userSessions')
      .child(uid)
      .limitToFirst(limit)
      .on('value', async userSessions => {
        if (userSessions.val()) {
          const chats = await Promise.all(
            Object.keys(userSessions.val()).map(async session => {
              const type = userSessions.val()[session] === 'private' ? 'privateSessions' : 'sessions';
              const snapshot = await firebase
                .database()
                .ref(`${type}/${session}`)
                .once('value');
              const lastMessage = await firebase
                .database()
                .ref('sessionChats')
                .child(session)
                .orderByKey()
                .limitToLast(1)
                .once('value');
              let message = { text: 'Beginning of chat' };
              if (lastMessage.val()) {
                const key = Object.keys(lastMessage.val())[0];
                message = { ...lastMessage.val()[key], key };
              }
              return { ...snapshot.val(), key: session, lastMessage: message };
            })
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

export const fetchMessages = (id, amount, uid, endAt) => {
  return async dispatch => {
    const ref = endAt
      ? firebase
          .database()
          .ref(`chats/${id}`)
          .orderByKey()
          .endAt(endAt)
          .limitToLast(amount)
      : firebase
          .database()
          .ref(`chats/${id}`)
          .orderByKey()
          .limitToLast(amount);
    const snapshot = await ref.once('value')
    const messages = {};
    try {
      const url = await firebase
        .storage()
        .ref(`images/${uid}`)
        .child('avatar')
        .getDownloadURL()
      snapshot.forEach(child => {
        if (child.val().user && child.val().user._id === uid) {
          messages[child.key] = {
            ...child.val(),
            key: child.key,
            createdAt: new Date(child.val().createdAt),
            user: { ...child.val().user, avatar: url },
          };
        } else {
          messages[child.key] = { ...child.val(), key: child.key, createdAt: new Date(child.val().createdAt) };
        }
        return false;
      });
      dispatch(setMessageSession(id, messages));
    } catch (e) {
      snapshot.forEach(child => {
        messages[child.key] = { ...child.val(), key: child.key, createdAt: new Date(child.val().createdAt) };
        return false;
      });
      dispatch(setMessageSession(id, messages));
    }
  };
};

export const fetchSessionMessages = (id, amount, isPrivate = false, endAt) => {
  return dispatch => {
    const type = isPrivate ? 'privateSessions' : 'sessions';
    const ref = endAt
      ? firebase
          .database()
          .ref('sessionChats/' + id)
          .endAt(endAt)
          .limitToLast(amount)
      : firebase
          .database()
          .ref('sessionChats/' + id)
          .limitToLast(amount);
    return ref.once('value', snapshot => {
      const messages = {};
      const promises = [];
      firebase
        .database()
        .ref(type + '/' + id)
        .child('users')
        .once('value', users => {
          users.forEach(child => {
            promises.push(
              new Promise(resolve => {
                firebase
                  .storage()
                  .ref('images/' + child.key)
                  .child('avatar')
                  .getDownloadURL()
                  .then(url => resolve({ [child.key]: url }))
                  .catch(e => resolve({ [child.key]: null }));
              })
            );
            return false;
          });
          Promise.all(promises).then(array => {
            let avatars = {};
            array.forEach((avatar, index) => {
              let key = Object.keys(avatar)[0];
              if (key) {
                avatars[key] = avatar[key];
              }
            });
            snapshot.forEach(child => {
              let avatar = child.val().user ? avatars[child.val().user._id] : '';
              if (avatar) {
                messages[child.key] = {
                  ...child.val(),
                  key: child.key,
                  createdAt: new Date(child.val().createdAt),
                  user: { ...child.val().user, avatar },
                };
              } else {
                messages[child.key] = { ...child.val(), key: child.key, createdAt: new Date(child.val().createdAt) };
              }
              return false;
            });
            dispatch(setMessageSession(id, messages));
          });
        });
    });
  };
};

export const fetchGymMessages = (id, amount, endAt) => {
  return dispatch => {
    const ref = endAt
      ? firebase
          .database()
          .ref(`gymChats/${id}`)
          .endAt(endAt)
          .limitToLast(amount)
      : firebase
          .database()
          .ref(`gymChats/${id}`)
          .limitToLast(amount);
    return ref.once('value', snapshot => {
      const messages = {};
      const promises = [];
      firebase
        .database()
        .ref(`gyms/${id}`)
        .child('users')
        .once('value', users => {
          users.forEach(child => {
            promises.push(
              new Promise(resolve => {
                firebase
                  .storage()
                  .ref(`images/${child.key}`)
                  .child('avatar')
                  .getDownloadURL()
                  .then(url => resolve({ [child.key]: url }))
                  .catch(e => resolve({ [child.key]: null }));
              })
            );
            return false;
          });
          Promise.all(promises).then(array => {
            let avatars = {};
            array.forEach((avatar, index) => {
              let key = Object.keys(avatar)[0];
              if (key) {
                avatars[key] = avatar[key];
              }
            });
            snapshot.forEach(child => {
              const avatar = child.val().user ? avatars[child.val().user._id] : '';
              if (avatar) {
                messages[child.key] = {
                  ...child.val(),
                  key: child.key,
                  createdAt: new Date(child.val().createdAt),
                  user: { ...child.val().user, avatar },
                };
              } else {
                messages[child.key] = { ...child.val(), key: child.key, createdAt: new Date(child.val().createdAt) };
              }
              return false;
            });
            dispatch(setMessageSession(id, messages));
          });
        });
    });
  };
};

export const muteChat = (id, mute) => {
  return (dispatch, getState) => {
    const { uid } = getState().profile.profile;
    dispatch(setMute(id, mute));
    firebase
      .database()
      .ref(`muted/${uid}`)
      .child(id)
      .set(mute);
  };
};
