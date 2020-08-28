import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import db from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import {navigateFromNotif, shouldNavigate} from './navigation';
import {LoginNavigationProp, LoginRouteProp} from '../types/views/Login';

export const createChannels = () => {
  const channelData = [
    {
      id: 'REQUEST',
      name: 'Pal requests',
      description: 'Channel for pal requests',
    },
    {
      id: 'DIRECT_MESSAGES',
      name: 'Direct messages',
      description: 'Channel for direct messages from pals',
    },
    {
      id: 'SESSION_MESSAGES',
      name: 'Session messages',
      description: 'Channel for session messages',
    },
    {
      id: 'GYM_MESSAGES',
      name: 'Gym messages',
      description: 'Channel for gym messages',
    },
    {
      id: 'COMMENT',
      name: 'Comment',
      description: 'Channel for comments on posts',
    },
    {
      id: 'REP',
      name: 'Rep',
      description: 'Channel for reps',
    },
    {
      id: 'ADDED_TO_SESSION',
      name: 'Added to session',
      description: 'Channel for when you get added to a session',
    },
  ];

  channelData.forEach(({id, description, name}) =>
    PushNotification.createChannel(
      {
        channelId: id,
        channelDescription: description,
        channelName: name,
      },
      (created) => console.log(`createChannel returned '${created}'`),
    ),
  );
};

export const setupNotifications = (
  uid: string,
  navigation: LoginNavigationProp,
  route: LoginRouteProp,
) => {
  messaging().onTokenRefresh((token) => {
    database().ref(`users/${uid}`).child('FCMToken').set(token);
  });
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: ({token}) => {
      console.log('TOKEN:', token);
      db().collection('users').doc(uid).update({FCMToken: token});
      database().ref('users').child(uid).update({FCMToken: token});
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: (notification) => {
      console.log('NOTIFICATION:', notification);
      if (notification.userInteraction) {
        if (shouldNavigate(notification)) {
          navigateFromNotif(notification, navigation);
        }
      }

      // process the notification

      // required on iOS only (see fetchCompletionHandler docs: https://github.com/react-native-community/react-native-push-notification-ios)
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
    // senderID: '48631950986',

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must
     *  */
    requestPermissions: true,
  });
};
