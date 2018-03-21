
import React from "react"
import { AppRegistry, Platform, Alert, AppState } from 'react-native'
import { StackNavigator } from "react-navigation"
import { TabNavigator } from "react-navigation"
import Login from './login'
import SignUp from './SignUp'
import Home from './Home'
import Friends from './Friends'
import Profile from './Profile'
import Settings from './Settings'
import Messaging from './chat/Messaging'
import DirectMessages from './chat/DirectMessages'
import SessionChats from './chat/SessionChats'
import SecondScreen from "./SecondScreen"
import SessionType from './sessions/SessionType'
import SessionDetail from './sessions/SessionDetail'
import * as firebase from "firebase"
import { Root, Header } from 'native-base'
import colors from 'Anyone/constants/colors'
import color from 'color'
import { isIphoneX } from 'react-native-iphone-x-helper'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'

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

FCM.on(FCMEvent.RefreshToken, token => {
  let user = firebase.auth().currentUser
  if (user) {
    firebase.database().ref('users/' + user.uid).child('FCMToken').set(token)
  }
  console.log("TOKEN (refreshUnsubscribe)", token);
})

FCM.on(FCMEvent.Notification, async (notif) => {
    let state = AppState.currentState
    // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload

    if(notif.local_notification){
      //this is a local notification

    }
    if(notif.opened_from_tray){
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
        showLocalNotification(notif)
      }
    }
  }
    catch(e) {
      Alert.alert(e.message)
    }
  })


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
    })
    }
  }

}


class App extends React.Component {
  componentDidMount() {
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
  const { navigation } = this.props
    return <Root><Login navigation={navigation} /></Root>
  }
}

App.navigationOptions = {
  title: ""
}
const sessions = StackNavigator({
  Home : {screen: Home},
  SessionType: { screen: SessionType, navigationOptions: {tabBarVisible: false} },
  SessionDetail: { screen: SessionDetail, navigationOptions: {tabBarVisible: false} },
},{
  mode: 'modal',
  headerMode: 'none'
})


const chats = TabNavigator({
  SessionChats: {screen: SessionChats},
  DirectMessages: {screen: DirectMessages},
}, {
  tabBarPosition: 'top',
  swipeEnabled: false,
  lazyLoad: true,
  animationEnabled: false,
  tabBarOptions: {
    showIcon: false,
    showLabel: true,
    labelStyle: {
      fontSize: 15,
      fontFamily: 'Avenir'
    },
    activeTintColor: '#fff',
    inactiveTintColor: colors.secondary,
    tabStyle: {
      justifyContent: isIphoneX()? 'flex-end' :'center',
      marginBottom: Platform.select({ios: isIphoneX()? -20: -10})
    },
    style: {
      backgroundColor: colors.primary,
      height: Platform.select({ios: isIphoneX()? 50 : 70}),
      justifyContent: isIphoneX()? 'center' : null,
    },
    indicatorStyle: {
      backgroundColor: '#fff'
    },
  }
})

const tabs = TabNavigator({
	Home : {screen: sessions},
  Friends: {screen: Friends},
  Chat: {screen: chats},
	Profile: {screen: Profile},
	Settings: {screen: Settings}
}, {
  tabBarPosition: 'bottom',
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: colors.primary,
    inactiveTintColor: color(colors.secondary).lighten(0.3).hex(),
    style: { backgroundColor: '#fff' },
    indicatorStyle: { backgroundColor: colors.primary },
    showIcon: true,
    showLabel: false,
  },
})

const SimpleApp = StackNavigator({
  Login : { screen: App, navigationOptions: {header: null} },
  SignUp: { screen: SignUp},
  MainNav: { screen: tabs},
  Messaging: {screen: Messaging},
  SecondScreen: { screen: SecondScreen, title: "Second Screen" }
})


// const sessionNav = StackNavigator({

// })



AppRegistry.registerComponent('Anyone', () => SimpleApp);
