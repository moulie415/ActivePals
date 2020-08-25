// import React, { Component, FunctionComponent } from 'react';
// import { Platform, AppState, SafeAreaView } from 'react-native';
// import { createAppContainer } from 'react-navigation';
// import { createBottomTabNavigator, createMaterialTopTabNavigator, MaterialTopTabBar } from 'react-navigation-tabs';
// import { createStackNavigator } from 'react-navigation-stack';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/lib/integration/react';
// import { persistStore } from 'redux-persist';
// import { createStore, applyMiddleware, compose } from 'redux';
// import database from '@react-native-firebase/database';
// import Sound from 'react-native-sound';
// import GeoFire from 'geofire';
// import thunk from 'redux-thunk';
// import { MaterialTabBarProps } from 'react-navigation-tabs/lib/typescript/src/types';
// import color from 'color';
// import Instabug from 'instabug-reactnative';
// import reducer from './reducers';
// import str from './constants/strings';
// import Login from './views/Login';
// import SignUp from './views/SignUp';
// import Home from './views/Home';
// import Sessions from './views/sessions/Sessions';
// import SessionInfo from './views/sessions/SessionInfo';
// import Friends from './views/Friends';
// import Profile from './views/Profile';
// import ProfileView from './views/ProfileView';
// import PostView from './views/PostView';
// import Settings from './views/Settings';
// import Messaging from './views/chat/Messaging';
// import DirectMessages from './views/chat/DirectMessages';
// import SessionChats from './views/chat/SessionChats';
// import GymChat from './views/chat/GymChat';
// import TestScreen from './views/TestScreen';
// import SessionDetail from './views/sessions/SessionDetail';
// import FilePreview from './views/FilePreview';
// import Notifications from './views/notifications';
// import Gym from './views/Gym';
// import Credits from './views/Credits';
// import colors from './constants/colors';
// import FullScreenVideo from './views/FullScreenVideo';
// import Welcome from './views/Welcome';
// import Form from './views/Form';
// import { UserState } from './types/Profile';
// import NavigationService from './actions/navigation';
// import ChatTabBarIcon from './components/ChatTabBarIcon';
// import ChatTabLabel from './components/ChatTabLabel';
// import { MessageType } from './types/Message';
// import { NotificationType } from './types/Notification';
// import { setNotificationCount } from './actions/home';
// import { newNotification, updateLastMessage, resetUnreadCount } from './actions/chats';
// import { createChannels } from './helpers/notifications';
// import { shouldNavigate, navigateFromNotif } from './helpers/navigation';

// const notifSound = new Sound(str.notifSound, Sound.MAIN_BUNDLE, error => {
//   if (error) {
//     console.warn('failed to load the sound', error);
//   }
// });

// const firebaseRef = database().ref('locations');
// export const geofire = new GeoFire(firebaseRef);

// const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// export const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk)));

// export const showLocalNotification = notif => {
//   const user = firebase.auth().currentUser;
//   if (notif.uid !== user.uid) {
//     if (shouldNavigate(notif)) {
//       const notification = new firebase.notifications.Notification()
//         .setTitle(notif.title)
//         .setBody(notif.body)
//         .setData(notif)
//         .setSound(str.notifSound)
//         .android.setSmallIcon('ic_notification')
//         // .android.setLargeIcon('ic_notification_large')
//         .android.setAutoCancel(true)
//         .android.setGroupSummary(true)
//         .android.setGroup(notif.group)
//         .android.setPriority(firebase.notifications.Android.Priority.Max)
//         .android.setChannelId(notif.channel)
//         // .android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
//         .setNotificationId(notif.group);

//       firebase
//         .notifications()
//         .displayNotification(notification)
//         .catch(err => console.error(err));
//     } else {
//       notifSound.play();
//       const { type, gymId, sessionId, uid } = notif;
//       if (type === MessageType.GYM_MESSAGE || type === MessageType.SESSION_MESSAGE || type === MessageType.MESSAGE) {
//         const id = gymId || sessionId || uid;
//         // @ts-ignore
//         store.dispatch(resetUnreadCount(id));
//       }
//     }
//   }
// };

// export const persistor = persistStore(store);

// export const handleNotification = (notification, showLocal = true) => {
//   const { dispatch, getState } = store;
//   const { type } = notification;
//   const localTypes = [
//     MessageType.MESSAGE,
//     MessageType.SESSION_MESSAGE,
//     MessageType.GYM_MESSAGE,
//     NotificationType.FRIEND_REQUEST,
//     NotificationType.ADDED_TO_SESSION,
//     NotificationType.FRIEND_REQUEST,
//   ];
//   if (localTypes.includes(type)) {
//     dispatch(newNotification(notification));
//     if (type === MessageType.GYM_MESSAGE || type === MessageType.SESSION_MESSAGE || type === MessageType.MESSAGE) {
//       // @ts-ignore
//       dispatch(updateLastMessage(notification));
//     }
//     showLocal && showLocalNotification(notification);
//   }
//   if (
//     type === NotificationType.POST_REP ||
//     type === NotificationType.COMMENT ||
//     type === NotificationType.FRIEND_REQUEST ||
//     type === NotificationType.COMMENT_MENTION ||
//     type === NotificationType.POST_MENTION
//   ) {
//     const count = getState().profile.profile.unreadCount || 0;
//     dispatch(setNotificationCount(count + 1));
//   }
// };

// const SafeAreaMaterialTopTabBar: FunctionComponent<MaterialTabBarProps> = ({ ...props }) => (
//   <SafeAreaView style={{ backgroundColor: colors.primary }}>
//     <MaterialTopTabBar {...props} />
//   </SafeAreaView>
// );

// const chats = createMaterialTopTabNavigator(
//   {
//     SessionChats: {
//       screen: SessionChats,
//       navigationOptions: { tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Sessions" color={tintColor} /> },
//     },
//     DirectMessages: {
//       screen: DirectMessages,
//       navigationOptions: { tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Pals" color={tintColor} /> },
//     },
//     GymChat: {
//       screen: GymChat,
//       navigationOptions: {
//         tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Gym" color={tintColor} />,
//       },
//     },
//   },
//   {
//     tabBarComponent: props => <SafeAreaMaterialTopTabBar {...props} />,
//     tabBarPosition: 'top',
//     tabBarOptions: {
//       showLabel: true,
//       labelStyle: {
//         fontSize: 15,
//         fontFamily: 'Montserrat',
//       },
//       activeTintColor: '#fff',
//       inactiveTintColor: colors.secondary,
//       style: {
//         backgroundColor: colors.primary,
//       },
//       indicatorStyle: {
//
//       },
//     },
//   }
// );

// const tabs = createBottomTabNavigator(
//   {
//     Home: { screen: Home },
//     Sessions: { screen: Sessions },
//     // PersonalTraining: { screen: PersonalTraining },
//     Friends: { screen: Friends },
//     Chat: { screen: chats, navigationOptions: { tabBarIcon: ({ tintColor }) => <ChatTabBarIcon color={tintColor} /> } },
//     Profile: { screen: Profile },
//   },
//   {
//     tabBarOptions: {
//       activeTintColor: colors.primary,
//       inactiveTintColor: color(colors.secondary)
//         .lighten(0.3)
//         .hex(),
//       style: {  },
//       showIcon: true,
//       labelStyle: {
//         fontSize: 10,
//         margin: 0,
//         marginTop: Platform.OS === 'android' ? 5 : 0,
//         padding: 0,
//       },
//       // showLabel: false,
//     },
//   }
// );

// export const Stack = createStackNavigator(
//   {
//     Login: { screen: Login },
//     SessionDetail: { screen: SessionDetail },
//     SessionInfo: { screen: SessionInfo },
//     SignUp: { screen: SignUp },
//     MainNav: { screen: tabs },
//     Messaging: { screen: Messaging },
//     Settings: { screen: Settings },
//     TestScreen: { screen: TestScreen },
//     FilePreview: { screen: FilePreview },
//     ProfileView: { screen: ProfileView },
//     PostView: { screen: PostView },
//     Notifications: { screen: Notifications },
//     Gym: { screen: Gym },
//     Welcome: { screen: Welcome },
//     Credits: { screen: Credits },
//     FullScreenVideo: { screen: FullScreenVideo },
//     Form: { screen: Form },
//   },
//   {
//     headerMode: 'none',
//   }
// );

// const Navigation = createAppContainer(Stack);

// class App extends Component {
//   messageListener: () => void;

//   notificationDisplayedListener: () => void;

//   notificationListener: () => void;

//   notificationOpenedListener: () => void;

//   onTokenRefreshListener: () => void;

//   unsubscriber: () => void;

//   constructor(props) {
//     super(props);
//     Instabug.setWelcomeMessageMode(Instabug.welcomeMessageMode.disabled);
//     Instabug.startWithToken('804c8f8e35fa17bdafb82e6778629dd4', [Instabug.invocationEvent.shake]);
//   }

//   async componentDidMount() {
//     AppState.addEventListener('change', this.handleAppStateChange);

//     createChannels();

//     this.messageListener = firebase.messaging().onMessage(notification => {
//       handleNotification(notification.data);
//     });

//     this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed(notification => {
//       // Process your notification as required
//       // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
//       console.log(notification);
//     });

//     this.notificationListener = firebase.notifications().onNotification(notification => {
//       // Process your notification as required
//       handleNotification(notification.data);
//     });

//     this.notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
//       // Get the action triggered by the notification being opened
//       // Get information about the notification that was opened
//       const { action, notification } = notificationOpen;

//       const state = AppState.currentState;
//       if (state !== 'active') {
//         handleNotification(notification.data, false);
//       }
//       navigateFromNotif(notification.data);
//     });

//     firebase
//       .notifications()
//       .getInitialNotification()
//       .then(notificationOpen => {
//         if (notificationOpen) {
//           // App was opened by a notification
//           // Get the action triggered by the notification being opened
//           // Get information about the notification that was opened
//           const { action, notification } = notificationOpen;
//         }
//       });

//     this.unsubscriber = firebase.auth().onAuthStateChanged(async user => {
//       if (user) {
//         const fcmToken = await firebase.messaging().getToken();
//         if (fcmToken) {
//           firebase
//             .database()
//             .ref(`users/${user.uid}`)
//             .child('FCMToken')
//             .set(fcmToken);
//           console.log(`fcm token: ${fcmToken}`);
//         } else {
//           console.log('no token');
//         }
//       }
//     });

//     this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
//       // Process your token as required
//       const user = firebase.auth().currentUser;
//       if (user) {
//         firebase
//           .database()
//           .ref(`users/${user.uid}`)
//           .child('FCMToken')
//           .set(fcmToken);
//       } else console.log('no user to set token on');
//     });
//   }

//   componentWillUnmount() {
//     AppState.removeEventListener('change', this.handleAppStateChange);
//     this.notificationDisplayedListener();
//     this.notificationListener();
//     this.notificationOpenedListener();
//     this.onTokenRefreshListener();
//     this.messageListener();
//     this.unsubscriber();
//   }

//   handleAppStateChange = nextAppState => {
//     const user = firebase.auth().currentUser;
//     if (user) {
//       if (nextAppState === 'active') {
//         firebase
//           .database()
//           .ref(`users/${user.uid}`)
//           .child('state')
//           .set(UserState.ONLINE);
//       } else {
//         firebase
//           .database()
//           .ref(`users/${user.uid}`)
//           .child('state')
//           .set(UserState.AWAY);
//       }
//     }
//   };

//   render() {
//     return (
//       <PersistGate persistor={persistor}>
//         <Provider store={store}>
//           <Navigation
//             ref={navigatorRef => {
//               NavigationService.setTopLevelNavigator(navigatorRef);
//             }}
//           />
//         </Provider>
//       </PersistGate>
//     );
//   }
// }

// export default App;
