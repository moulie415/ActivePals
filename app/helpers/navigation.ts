import NavigationService from '../actions/navigation';

export const shouldNavigate = notification => {
  const { nav } = NavigationService.getNavigator().state;
  if (nav.routes.length > 0) {
    const route = nav.routes[nav.index];
    if (route.params) {
      const { chatId, session, gymId } = route.params;
      return (
        !(chatId && notification.chatId === chatId) &&
        !(session && session.key === notification.sessionId) &&
        !(gymId && gymId === notification.gymId)
      );
    }
  }
  return true;
};

export const navigateFromNotif = notif => {
  const { type, sessionId, sessionTitle, chatId, uid, username, postId, gymId, isPrivate } = notif;
  if (type === 'sessionMessage') {
    const session = { key: sessionId, title: sessionTitle, private: notif.private === 'privateSessions' };
    NavigationService.navigate('Messaging', { session });
  }
  switch (type) {
    case 'message':
      NavigationService.navigate('Messaging', { chatId, friendUsername: username, friendUid: uid });
      break;
    case 'gymMessage':
      NavigationService.navigate('Messaging', { gymId });
      break;
    case 'friendRequest':
      NavigationService.navigate('Friends');
      break;
    case 'comment':
    case 'rep':
      NavigationService.navigate('PostView', { postId });
      break;
    case 'addedToSession':
      NavigationService.navigate('SessionInfo', { sessionId, isPrivate });
      break;
    default:
      console.log('invalid notif type');
  }
};