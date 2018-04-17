
import React from "react"
import { AppRegistry, Platform, Alert, AppState, YellowBox } from 'react-native'
import { StackNavigator } from "react-navigation"
import { TabNavigator } from "react-navigation"
import * as firebase from "firebase"
import { Root } from 'native-base'
import colors from 'Anyone/constants/colors'
import color from 'color'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers/'
import thunk from 'redux-thunk'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import App from './App'
import { navigateMessaging, navigateMessagingSession, navigateFriends } from "./actions/navigation"
import { newNotification, updateLastMessage } from './actions/chats'
import {
  createReactNavigationReduxMiddleware,
  createReduxBoundAddListener,
} from 'react-navigation-redux-helpers'

let config = {
  apiKey: "AIzaSyDIjOw0vXm7e_4JJRbwz3R787WH2xTzmBw",
  authDomain: "anyone-80c08.firebaseapp.com",
  databaseURL: "https://anyone-80c08.firebaseio.com",
  projectId: "anyone-80c08",
  storageBucket: "anyone-80c08.appspot.com",
  messagingSenderId: "680139677816"
}
firebase.initializeApp(config)
export default firebase



const showLocalNotification = (notif) => {
  if (notif.custom_notification) {
    let user = firebase.auth().currentUser
    if (notif.type != 'sessionMessage' || 
      (notif.type == 'sessionMessage' && notif.uid != user.uid)) {
      let custom = JSON.parse(notif.custom_notification)
      FCM.presentLocalNotification({
        title: custom.title,
        body: custom.body,
        priority: custom.priority,
        sound: "default",
      //click_action: notif.click_action,
      show_in_foreground: true,
      lights: true,
      vibrate: 300,
      group: custom.group,
      data: notif
    })
    }
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

FCM.on(FCMEvent.Notification, async (notif) => {
  console.log(store)
  let state = AppState.currentState
    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
    const { dispatch } = store

    if (!notif.opened_from_tray) {
     if (notif.type == 'message' || notif.type == 'sessionMessage') {
      dispatch(newNotification(notif))
      dispatch(updateLastMessage(notif))
    }
  }

    if(notif.local_notification){
      //this is a local notification

    }
    if(notif.opened_from_tray){
       if (notif.data) {
              const {  type, sessionId, sessionTitle, chatId, uid, username } = notif.data
              
              switch(type) {
                case 'message':
                  dispatch(navigateMessaging(chatId, username, uid))
                  break
                case 'sessionMessage':
                  dispatch(navigateMessagingSession(true, sessionId, sessionTitle))
                  break
                case 'buddyRequest':
                  dispatch(navigateFriends())
                  break

              }

          }

      //}
      //iOS: app is open/resumed because user clicked banner
      //Android: app is open/resumed because user clicked banner or tapped app icon
    }
    // await someAsyncCall();

    if(Platform.OS ==='ios'){
      if (notif._actionIdentifier === 'com.myapp.MyCategory.Confirm') {
        // handle notification action here
        // the text from user is in notif._userText if type of the action is NotificationActionType.TextInput
      }
      //optional
      //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application.
      //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
      //notif._notificationType is available for iOS platfrom
      switch(notif._notificationType){
        case NotificationType.Remote:
          notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
          break
          case NotificationType.NotificationResponse:
          notif.finish()
          break
          case NotificationType.WillPresent:
          notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
          break
        }

      }
      try {
          if (!notif.opened_from_tray) {
            if (Platform.OS == 'ios' || state != 'background') {
              if (notif.type) {
                showLocalNotification(notif)
              }
            }
          }
      }
    catch(e) {
      Alert.alert(e.message)
    }
  })


class FitLink extends React.Component {
  componentDidMount() {
    //ignore setting a timer warnings
    YellowBox.ignoreWarnings(['Setting a timer'])

    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
      let user = firebase.auth().currentUser
      if (user) {
        firebase.database().ref('users/' + user.uid).child('FCMToken').set(token)
      }
      console.log("TOKEN (refreshUnsubscribe)", token);
    })
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        FCM.getFCMToken().then(token => {
          firebase.database().ref('users/' + user.uid).child('FCMToken').set(token)
        })
      } else {
      }
    })

  }
  render () {
    return <Root>
        <Provider store={store}>
          <App/>
        </Provider>
      </Root>
  }
}


// const sessionNav = StackNavigator({

// })



AppRegistry.registerComponent('Anyone', () => FitLink)
