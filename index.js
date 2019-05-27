
import React from "react"
import { AppRegistry, YellowBox } from 'react-native'
//import * as firebase from "firebase"
import firebase from 'react-native-firebase' //above is web api
import { Root } from 'native-base'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import { persistStore } from 'redux-persist'
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from 'Anyone/js/reducers/'
import thunk from 'redux-thunk'

//import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import App from 'Anyone/js/App'
import { navigateMessaging, navigateMessagingSession, navigateFriends, navigatePostView } from 'Anyone/js/actions/navigation'
import { newNotification, updateLastMessage } from 'Anyone/js/actions/chats'
import GeoFire from 'geofire'
import bgMessaging from './js/bgMessaging'

import {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
} from 'react-navigation-redux-helpers'
import { setNotificationCount } from "./js/actions/home"
import { navigateGymMessaging } from "./js/actions/navigation"

let firebaseRef = firebase.database().ref('locations')
export const geofire = new GeoFire(firebaseRef)

export const showLocalNotification = (notif) => {
  if (notif.custom_notification) {
    let user = firebase.auth().currentUser
    if (notif.uid != user.uid) {
      let custom = JSON.parse(notif.custom_notification)
      const notification = new firebase.notifications.Notification()
        .setTitle(custom.title)
        .setBody(custom.body)
        .setData(notif)
        .setSound('notif.wav')
        .android.setSmallIcon('ic_notification')
        .android.setAutoCancel(true)
        .android.setGroupSummary(true)
        .android.setGroup(custom.group)
        .android.setPriority(firebase.notifications.Android.Priority.Max)
        .android.setChannelId(custom.channel)
        //.android.setGroupAlertBehaviour(firebase.notifications.Android.GroupAlert.Children)
        .setNotificationId(custom.group)
      
        firebase.notifications()
          .displayNotification(notification)
          .catch(err => console.error(err))
    }
  }

}

const navigateFromNotif = (notif) => {
  const { dispatch } = store
  const {  type, sessionId, sessionTitle, chatId, uid, username, postId, gymId } = notif
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
    case 'buddyRequest':
      dispatch(navigateFriends())
      break
    case 'rep':
      dispatch(navigatePostView(postId))
      break
    case 'comment':
      dispatch(navigatePostView(postId))
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

export const handleNotification = (notification) => {
  const { dispatch, getState } = store
  const {  type } = notification.data
  if (type == 'message' || type == 'sessionMessage' || type == 'gymMessage' || type == 'buddyRequest') {
    dispatch(newNotification(notification.data))
    dispatch(updateLastMessage(notification.data))
    showLocalNotification(notification.data)
  }
  if (type == 'rep' || type == 'comment' || type == 'buddyRequest') {
    const count = getState().profile.profile.unreadCount || 0
    dispatch(setNotificationCount(count+1))
  }
}


class FitLink extends React.Component {
  componentDidMount() {
    //ignore setting a timer warnings
    YellowBox.ignoreWarnings(['Setting a timer', 'Require cycle:', 'Received data was not a string, or was not a recognised encoding'])
    const channels = []
    channels.push(new firebase.notifications.Android.Channel('REQUEST', 'Pal requests', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for pal requests')
        .setSound('notif.wav'))

    channels.push(new firebase.notifications.Android.Channel('DIRECT_MESSAGES', 'Direct messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for direct messages from buddies')
        .setSound('notif.wav'))

    channels.push(new firebase.notifications.Android.Channel('SESSION_MESSAGES', 'Session messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for session messages')
        .setSound('notif.wav'))

    channels.push(new firebase.notifications.Android.Channel('GYM_MESSAGES', 'Gym messages', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for gym messages')
        .setSound('notif.wav'))

    channels.push(new firebase.notifications.Android.Channel('COMMENT', 'Comment', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for comments on posts')
        .setSound('notif.wav'))
    
    channels.push(new firebase.notifications.Android.Channel('REP', 'Rep', firebase.notifications.Android.Importance.Max)
        .setDescription('Channel for reps')
        .setSound('notif.wav'))
   
    channels.forEach(channel => {
      firebase.notifications().android.createChannel(channel)
    })

    

    this.messageListener = firebase.messaging().onMessage(notification => {
      handleNotification(notification)
    })

    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed(notification => {
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
      console.log(notification)
    })
    this.notificationListener = firebase.notifications().onNotification(notification => {
      // Process your notification as required
      handleNotification(notification)
    })
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action
      // Get information about the notification that was opened
      const notification = notificationOpen.notification
      let nav = store.getState().nav
      let routes = nav.routes
      let route = {}
      if (routes) {
        route = routes[nav.index]
      }
      if (!route.params || 
        (route.params.chatId && route.params.chatId != notification.data.chatId ||
         route.params.session && route.params.session.key != notification.data.sessionId ||
         route.params.gymId && route.params.gymId != notification.data.gymId)) {
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
      let user = firebase.auth().currentUser
      if (user) {
        firebase.database().ref('users/' + user.uid).child('FCMToken').set(fcmToken)
      }
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
