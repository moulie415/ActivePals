import {navigate, navigationRef} from '../RootNavigation';
import {PushNotificationData} from '../types/Shared';
import {store} from '../App';
import {resetUnreadCount} from '../actions/chats';

export const shouldNavigate = (notification: PushNotificationData) => {
  const route = navigationRef.current?.getCurrentRoute();
  if (route && route.params) {
    const {chatId, sessionId, gymId} = route.params;
    return (
      !(chatId && notification.chatId === chatId) &&
      !(sessionId === notification.sessionId) &&
      !(gymId && gymId === notification.gymId)
    );
  }
  return true;
};

export const navigateFromNotif = (notif: PushNotificationData) => {
  const {
    type,
    sessionId,
    chatId,
    uid,
    username,
    postId,
    gymId,
    isPrivate,
  } = notif;
  switch (type) {
    case 'message':
      navigate('Messaging', {
        chatId,
        friendUsername: username,
        friendUid: uid,
      });
      store.dispatch(resetUnreadCount(uid));
      break;
    case 'sessionMessage':
      navigate('Messaging', {sessionId});
      store.dispatch(resetUnreadCount(sessionId));
      break;
    case 'gymMessage':
      navigate('Messaging', {gymId});
      store.dispatch(resetUnreadCount(gymId));
      break;
    case 'friendRequest':
      navigate('Friends');
      break;
    case 'comment':
    case 'commentRep':
    case 'postRep':
      navigate('PostView', {postId});
      break;
    case 'addedToSession':
      navigate('SessionInfo', {sessionId, isPrivate});
      break;
    default:
      console.log('invalid notif type');
  }
};
