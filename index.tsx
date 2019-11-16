
import React from "react"
import { AppRegistry, YellowBox, AppState } from 'react-native'
//import * as firebase from "firebase"
import firebase from 'react-native-firebase' //above is web api
import { Root } from 'native-base'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistStore } from 'redux-persist'
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './app/reducers/'
import thunk from 'redux-thunk'

//import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import App from './app/App'
import { navigateMessaging, navigateMessagingSession, navigateFriends, navigatePostView, navigateSessionInfo } from './app/actions/navigation'
import { newNotification, updateLastMessage } from './app/actions/chats'
import GeoFire from 'geofire'
import bgMessaging from './app/bgMessaging'
import str from './app/constants/strings'

import {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
} from 'react-navigation-redux-helpers'
import { setNotificationCount } from "./app/actions/home"
import { navigateGymMessaging } from "./app/actions/navigation"
import Sound from 'react-native-sound'

const notifSound = new Sound(str.notifSound, Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.warn('failed to load the sound', error);
    return;
}})

const firebaseRef = firebase.database().ref('locations')
export const geofire = new GeoFire(firebaseRef)

export const showLocalNotification = (notif) => {
    const user = firebase.auth().currentUser
    if (notif.uid != user.uid) {
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
          //.android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
          .setNotificationId(notif.group)
        
          firebase.notifications()
            .displayNotification(notification)
            .catch(err => console.error(err))
      }
      else {
        notifSound.play()
      }
    }

}

const navigateFromNotif = (notif) => {
  const { dispatch } = store
  const {  type, sessionId, sessionTitle, chatId, uid, username, postId, gymId, isPrivate } = notif
  if (type == 'sessionMessage') {
    const session = {key: sessionId, title: sessionTitle, private: (notif.private == "privateSessions")}
    dispatch(navigateMessagingSession(session))
  }
  switch(type) {
    case 'message':
      dispatch(navigateMessaging(chatId, username, uid))
      break
    case 'gymMessage':
      dispatch(navigateGymMessaging(gymId))
      break
    case 'friendRequest':
      dispatch(navigateFriends())
      break
    case 'rep':
      dispatch(navigatePostView(postId))
      break
    case 'comment':
      dispatch(navigatePostView(postId))
      break
    case 'addedToSession':
      dispatch(navigateSessionInfo(sessionId, !!isPrivate))
      break
  }
}

const reactNavigationMiddleware = store => dispatch => action => {
  switch (action.type) {
    case 'Navigation/NAVIGATE':
      const { routeName } = action
      // if (routeName == 'Notifications') {
      //     dispatch(markInboxAsRead())
      // }
    default:
     return dispatch(action)
  }
}

const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
)

export const addListener = createReduxBoundAddListener("root")


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(middleware, reactNavigationMiddleware, thunk))
  //applyMiddleware(middleware, thunk)
)

export const persistor = persistStore(store)

export const handleNotification = (notification, showLocal = true) => {
  const { dispatch, getState } = store
  const { type } = notification
  const localTypes = ['message', 'sessionMessage', 'gymMessage', 'friendRequest', 'addedToSession']
  if (localTypes.includes(type)) {
    dispatch(newNotification(notification))
    dispatch(updateLastMessage(notification))
    showLocal && showLocalNotification(notification)
  }
  if (type == 'rep' ||
  type == 'comment' ||
  type == 'friendRequest' ||
  type == 'commentMention' ||
  type == 'postMention') {
    const count = getState().profile.profile.unreadCount || 0
    dispatch(setNotificationCount(count+1))
  }
}

const shouldNavigate = (notification) => {
  const nav = store.getState().nav
  const routes = nav.routes
  let route = {}
  if (routes) {
    route = routes[nav.index]
  }
  return  (!route.params || 
    (route.params.chatId && route.params.chatId != notification.chatId ||
     route.params.session && route.params.session.key != notification.sessionId ||
     route.params.gymId && route.params.gymId != notification.gymId)) 
}


class FitLink extends React.Component {
  async componentDidMount() {
    //ignore setting a timer warnings
    YellowBox.ignoreWarnings(['Setting a timer', 'Require cycle:', 'Received data was not a string, or was not a recognised encoding'])
    const channels = []
    channels.push(new firebase.notifications.Android.Channel('REQUEST', 'Pal requests', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for pal requests')
        .setSound(str.notifSound))

    channels.push(new firebase.notifications.Android.Channel('DIRECT_MESSAGES', 'Direct messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for direct messages from pals')
        .setSound(str.notifSound))

    channels.push(new firebase.notifications.Android.Channel('SESSION_MESSAGES', 'Session messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for session messages')
        .setSound(str.notifSound))

    channels.push(new firebase.notifications.Android.Channel('GYM_MESSAGES', 'Gym messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for gym messages')
        .setSound(str.notifSound))

    channels.push(new firebase.notifications.Android.Channel('COMMENT', 'Comment', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for comments on posts')
        .setSound(str.notifSound))
    
    channels.push(new firebase.notifications.Android.Channel('REP', 'Rep', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for reps')
        .setSound(str.notifSound))

    channels.push(new firebase.notifications.Android.Channel('ADDED_TO_SESSION', 'Added to session', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for when you get added to a session')
        .setSound(str.notifSound))
   
    channels.forEach(channel => {
      firebase.notifications().android.createChannel(channel)
    })

    

    this.messageListener = firebase.messaging().onMessage(notification => {
      handleNotification(notification.data)
    })

    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed(notification => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
      console.log(notification)
    })
    this.notificationListener = firebase.notifications().onNotification(notification => {
      // Process your notification as required
      handleNotification(notification.data)
    })
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action
      // Get information about the notification that was opened
      const notification = notificationOpen.notification

      const state = AppState.currentState
      if (state != 'active') {
        handleNotification(notification.data, false)
      }
      if (shouldNavigate(notification.data)) {
        navigateFromNotif(notification.data)
      }
     
    })

    firebase.notifications().getInitialNotification()
      .then((notificationOpen) => {
        if (notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action
          // Get information about the notification that was opened
          const notification = notificationOpen.notification
        }
      })
    

      this.unsubscriber = firebase.auth().onAuthStateChanged(user => {
        if (user) {
            firebase.messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    firebase.database().ref('users/' + user.uid).child('FCMToken').set(fcmToken)
                    console.log('fcm token: ' + fcmToken)
                } else {
                    console.log('no token')
                }
            })
        }
      })

    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
      // Process your token as required
      const user = firebase.auth().currentUser
      if (user) {
        firebase.database().ref('users/' + user.uid).child('FCMToken').set(fcmToken)
      }
      else console.log('no user to set token on')
    })
  }

  componentWillUnmount() {
    this.notificationDisplayedListener()
    this.notificationListener()
    this.notificationOpenedListener()
    this.onTokenRefreshListener()
    this.messageListener()
    this.unsubscriber()
  }

  render () {
    return <PersistGate persistor={persistor} >
      <Root>
        <Provider store={store}>
          <App/>
        </Provider>
      </Root>
      </PersistGate>
  }
}

AppRegistry.registerComponent('Anyone', () => FitLink)
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging)