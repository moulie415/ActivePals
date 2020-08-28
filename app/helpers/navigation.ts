import {LoginNavigationProp} from '../types/views/Login';

export const shouldNavigate = (notification) => {
  const {nav} = NavigationService.getNavigator().state;
  if (nav.routes.length > 0) {
    const route = nav.routes[nav.index];
    if (route.params) {
      const {chatId, session, gymId} = route.params;
      return (
        !(chatId && notification.chatId === chatId) &&
        !(session && session.key === notification.sessionId) &&
        !(gymId && gymId === notification.gymId)
      );
    }
  }
  return true;
};

export const navigateFromNotif = (notif, navigation: LoginNavigationProp) => {
  const {
    type,
    sessionId,
    sessionTitle,
    chatId,
    uid,
    username,
    postId,
    gymId,
    isPrivate,
  } = notif;
  if (type === 'sessionMessage') {
    navigation.navigate('Messaging', {sessionId});
  }
  switch (type) {
    case 'message':
      navigation.navigate('Messaging', {
        chatId,
        friendUsername: username,
        friendUid: uid,
      });
      break;
    case 'gymMessage':
      navigation.navigate('Messaging', {gymId});
      break;
    case 'friendRequest':
      navigation.navigate('Friends');
      break;
    case 'comment':
    case 'rep':
      navigation.navigate('PostView', {postId});
      break;
    case 'addedToSession':
      navigation.navigate('SessionInfo', {sessionId, isPrivate});
      break;
    default:
      console.log('invalid notif type');
  }
};
