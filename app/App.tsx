import React from "react"
import { 
  Platform,
  AppState,
  BackHandler,
} from 'react-native'
import Login from './views/login'
import SignUp from './views/SignUp'
import Home from './views/Home'
import Sessions from './sessions/Sessions'
import SessionInfo from './sessions/SessionInfo'
import Friends from './views/Friends'
import Profile from './views/Profile'
import ProfileView from './views/ProfileView'
import PostView from './views/PostView'
import Settings from './views/Settings'
import Messaging from './views/chat/Messaging'
import DirectMessages from './views/chat/DirectMessages'
import SessionChats from './views/chat/SessionChats'
import GymChat from './views/chat/GymChat'
import TestScreen from './views/TestScreen'
import SessionDetail from './sessions/SessionDetail'
import FilePreview from './views/FilePreview'
import Notifications from './views/notifications'
import Gym from './views/Gym'
import Credits from './views/Credits'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import color from 'color'
import { isIphoneX } from 'react-native-iphone-x-helper'
import FullScreenVideo from './views/FullScreenVideo'
import Welcome from './views/Welcome'
import PersonalTraining from './views/PersonalTraining'
import Form from './views/Form'
import { connect } from 'react-redux'
import { StackNavigator,  TabNavigator, addNavigationHelpers, NavigationActions } from "react-navigation"
import { addListener } from '../index'
import { UserState } from "./types/Profile"

const chats = TabNavigator({
  SessionChats: {screen: SessionChats},
  DirectMessages: {screen: DirectMessages},
  GymChat: {screen: GymChat}
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
      fontFamily: 'Montserrat',
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
  Sessions: {screen: Sessions},
  //PersonalTraining: { screen: PersonalTraining },
  Friends: {screen: Friends},
  Chat: {screen: chats, navigationOptions: {tabBarLabel: 'Chats'}},
	Profile: {screen: Profile},
}, {
  tabBarPosition: 'bottom',
  animationEnabled: false,
  navigationOptions: {
      gesturesEnabled: false,
    },
  tabBarOptions: {
    activeTintColor: colors.primary,
    inactiveTintColor: color(colors.secondary).lighten(0.3).hex(),
    style: { backgroundColor: '#fff' },
    indicatorStyle: { backgroundColor: colors.primary },
    showIcon: true,
    upperCaseLabel: false,
    labelStyle: {
      fontSize: 10,
      margin: 0,
      marginTop: Platform.OS == 'android' ?  5 : 0,
      padding: 0
    }
    //showLabel: false,
  },
})

export const Stack = StackNavigator({
  Login : { screen: Login, navigationOptions: {header: null} },
  SessionDetail: { screen: SessionDetail, navigationOptions: {tabBarVisible: false} },
  SessionInfo: {screen: SessionInfo, navigationOptions: {header: null}},
  SignUp: { screen: SignUp},
  MainNav: { screen: tabs},
  Messaging: {screen: Messaging},
  Settings: { screen: Settings },
  TestScreen: { screen: TestScreen },
  FilePreview: {screen : FilePreview },
  ProfileView: { screen: ProfileView },
  PostView: { screen: PostView },
  Notifications: { screen: Notifications },
  Gym: { screen: Gym },
  Welcome: {screen: Welcome, navigationOptions: {header: null}},
  Credits: {screen: Credits, navigationOptions: {header: null}},
  FullScreenVideo: {screen: FullScreenVideo, navigationOptions: { header: null}},
  Form: { screen: Form, navigationOptions: {header: null}}
})

class App extends React.Component {

    onBackPress() {
        const { dispatch, nav } = this.props
        if (nav.index !== 1) {
          dispatch(NavigationActions.back())
        }
        return true
    }

  componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', () => this.onBackPress());
      AppState.addEventListener('change', this._handleAppStateChange);
    }
  
    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
      BackHandler.removeEventListener('hardwareBackPress', () => this.onBackPress());
    }

    _handleAppStateChange = (nextAppState) => {
      let user = firebase.auth().currentUser
      if (user) {
        if (nextAppState == 'active') {
          firebase.database().ref('users/' + user.uid).child('state').set(UserState.ONLINE)
        }
        else {
          firebase.database().ref('users/' + user.uid).child('state').set(UserState.AWAY)
        }
      }
    }

  render () {
    const { nav, dispatch } = this.props
    return <Stack navigation={addNavigationHelpers({ dispatch, state:nav, addListener })} />
  }
}

export default connect(({nav})=>({nav}))(App)






