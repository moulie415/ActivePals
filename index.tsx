import React from 'react';
import { AppRegistry, YellowBox, AppState } from 'react-native';
import firebase from 'react-native-firebase';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistStore } from 'redux-persist';
import { createStore, applyMiddleware } from 'redux';
import Sound from 'react-native-sound';
import thunk from 'redux-thunk';
import GeoFire from 'geofire';
import reducer from './app/reducers';
import App from './app/App';
import NavigationService from './app/actions/navigation';
import { newNotification, updateLastMessage } from './app/actions/chats';
import bgMessaging from './app/bgMessaging';
import str from './app/constants/strings';
import { setNotificationCount } from './app/actions/home';

const notifSound = new Sound(str.notifSound, Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.warn('failed to load the sound', error);
  }
});

const firebaseRef = firebase.database().ref('locations');
export const geofire = new GeoFire(firebaseRef);

// const reactNavigationMiddleware = store => dispatch => action => {
//   switch (action.type) {
//     case 'Navigation/NAVIGATE':
//       const { routeName } = action
//     default:
//      return dispatch(action)
//   }
// }

//const middleware = createReactNavigationReduxMiddleware('root', state => state.nav);

//export const addListener = createReduxBoundAddListener('root');

//const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
  reducer,
  //composeEnhancers(applyMiddleware(middleware, reactNavigationMiddleware, thunk))
  applyMiddleware(/*middleware,*/ thunk)
);

const navigateFromNotif = notif => {
  const { type, sessionId, sessionTitle, chatId, uid, username, postId, gymId, isPrivate } = notif;
  if (type === 'sessionMessage') {
    const session = { key: sessionId, title: sessionTitle, private: notif.private === 'privateSessions' };
    NavigationService.navigate('Messaging', { session });
  }
  switch (type) {
    case 'message':
      NavigationService.navigate('Messaging', { chatId, username, uid });
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

const shouldNavigate = (notification) => {
  const { nav } = store.getState();
  const { routes } = nav;
  let route = {};
  if (routes) {
    route = routes[nav.index];
  }
  return  (!route.params || 
    (route.params.chatId && route.params.chatId != notification.chatId ||
     route.params.session && route.params.session.key != notification.sessionId ||
     route.params.gymId && route.params.gymId != notification.gymId)) 
}


export const showLocalNotification = notif => {
  const user = firebase.auth().currentUser;
  if (notif.uid !== user.uid) {
    if (shouldNavigate(notif)) {
      const notification = new firebase.notifications.Notification()
        .setTitle(notif.title)
        .setBody(notif.body)
        .setData(notif)
        .setSound(str.notifSound)
        .android.setSmallIcon('ic_notification')
        // .android.setLargeIcon('ic_notification_large')
        .android.setAutoCancel(true)
        .android.setGroupSummary(true)
        .android.setGroup(notif.group)
        .android.setPriority(firebase.notifications.Android.Priority.Max)
        .android.setChannelId(notif.channel)
        // .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
        .setNotificationId(notif.group);

      firebase
        .notifications()
        .displayNotification(notification)
        .catch(err => console.error(err));
    } else {
      notifSound.play();
    }
  }
}

export const persistor = persistStore(store);

export const handleNotification = (notification, showLocal = true) => {
  const { dispatch, getState } = store;
  const { type } = notification;
  const localTypes = ['message', 'sessionMessage', 'gymMessage', 'friendRequest', 'addedToSession'];
  if (localTypes.includes(type)) {
    dispatch(newNotification(notification));
    dispatch(updateLastMessage(notification));
    showLocal && showLocalNotification(notification);
  }
  if (
    type === 'rep' ||
    type === 'comment' ||
    type === 'friendRequest' ||
    type === 'commentMention' ||
    type === 'postMention'
  ) {
    const count = getState().profile.profile.unreadCount || 0;
    dispatch(setNotificationCount(count + 1));
  }
};

class ActivePals extends React.Component {
  async componentDidMount() {
    // ignore setting a timer warnings
    YellowBox.ignoreWarnings([
      'Setting a timer',
      'Require cycle:',
      'Received data was not a string, or was not a recognised encoding',
    ]);

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

    const channels = channelData.map(channel => {
      return new firebase.notifications.Android.Channel(
        channel.id,
        channel.name,
        firebase.notifications.Android.Importance.Max
      )
        .setDescription(channel.description)
        .setSound(str.notifSound);
    });

    channels.forEach(channel => {
      firebase.notifications().android.createChannel(channel);
    });

    this.messageListener = firebase.messaging().onMessage(notification => {
      handleNotification(notification.data);
    })

    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed(notification => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
      console.log(notification);
    })
    this.notificationListener = firebase.notifications().onNotification(notification => {
      // Process your notification as required
      handleNotification(notification.data);
    })
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action
      // Get information about the notification that was opened
      const notification = notificationOpen.notification

      const state = AppState.currentState
      if (state !== 'active') {
        handleNotification(notification.data, false)
      }
      if (shouldNavigate(notification.data)) {
        navigateFromNotif(notification.data);
      }
    });

    firebase
      .notifications()
      .getInitialNotification()
      .then(notificationOpen => {
        if (notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action
          // Get information about the notification that was opened
          const notification = notificationOpen.notification
        }
      })

    this.unsubscriber = firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          firebase
            .database()
            .ref(`users/${user.uid}`)
            .child('FCMToken')
            .set(fcmToken);
          console.log(`fcm token: ${fcmToken}`);
        } else {
          console.log('no token');
        }
      }
    });

    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
      // Process your token as required
      const user = firebase.auth().currentUser;
      if (user) {
        firebase
          .database()
          .ref(`users/${user.uid}`)
          .child('FCMToken')
          .set(fcmToken);
      } else console.log('no user to set token on');
    });
  }

  componentWillUnmount() {
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
    this.onTokenRefreshListener();
    this.messageListener();
    this.unsubscriber();
  }

  render() {
    return (
      <PersistGate persistor={persistor}>
        <Provider store={store}>
          <App />
        </Provider>
      </PersistGate>
    );
  }
}

AppRegistry.registerComponent('Anyone', () => ActivePals);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
