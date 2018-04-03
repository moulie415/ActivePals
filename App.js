
import React from "react"
import { 
  AppRegistry,
  Platform,
  Alert,
  AppState,
  BackHandler
} from 'react-native'
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
import colors from 'Anyone/constants/colors'
import color from 'color'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { Provider, connect } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers/'
import thunk from 'redux-thunk'
import { StackNavigator,  TabNavigator, addNavigationHelpers, NavigationActions } from "react-navigation"
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import { addListener } from './index'

// const sessions = StackNavigator({
//   Home : {screen: Home},
//   SessionType: { screen: SessionType, navigationOptions: {tabBarVisible: false} },
//   SessionDetail: { screen: SessionDetail, navigationOptions: {tabBarVisible: false} },
// },{
//   mode: 'modal',
//   headerMode: 'none'
// })


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
	Home : {screen: Home},
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

export const Stack = StackNavigator({
  Login : { screen: Login, navigationOptions: {header: null} },
  SessionType: { screen: SessionType, navigationOptions: {tabBarVisible: false} },
  SessionDetail: { screen: SessionDetail, navigationOptions: {tabBarVisible: false} },
  SignUp: { screen: SignUp},
  MainNav: { screen: tabs},
  Messaging: {screen: Messaging},
  SecondScreen: { screen: SecondScreen, title: "Second Screen" }
})

class App extends React.Component {
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => this.onBackPress());
    }

    onBackPress() {
        const { dispatch, nav } = this.props
        if (nav.index !== 1) {
          dispatch(NavigationActions.back())
        }
        return true
    }
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => this.onBackPress());
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
    const { nav, dispatch } = this.props
    return <Stack navigation={addNavigationHelpers({ dispatch, state:nav, addListener })} />
  }
}

export default connect(({nav})=>({nav}))(App)





