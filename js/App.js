import React from "react"
import { 
  AppRegistry,
  Platform,
  Alert,
  AppState,
  BackHandler,
} from 'react-native'
import Login from './login'
import SignUp from './SignUp'
import Home from './Home'
import Sessions from './Sessions'
import Friends from './Friends'
import Profile from './Profile'
import ProfileView from './ProfileView'
import PostView from './PostView'
import Settings from './Settings'
import Messaging from './chat/Messaging'
import DirectMessages from './chat/DirectMessages'
import SessionChats from './chat/SessionChats'
import GymChat from './chat/GymChat'
import TestScreen from './TestScreen'
import SessionType from './sessions/SessionType'
import SessionDetail from './sessions/SessionDetail'
import FilePreview from './FilePreview'
import Notifications from './notifications'
import Gym from './Gym'
import Credits from './Credits'
import firebase from 'react-native-firebase'
import colors from 'Anyone/js/constants/colors'
import color from 'color'
import { isIphoneX } from 'react-native-iphone-x-helper'
import FullScreenVideo from './FullScreenVideo'
import Welcome from './Welcome'
import PersonalTraining from './PersonalTraining'
import { Provider, connect } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers/'
import thunk from 'redux-thunk'
import { StackNavigator,  TabNavigator, addNavigationHelpers, NavigationActions } from "react-navigation"
import { addListener } from 'Anyone/index'

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
      fontFamily: 'Avenir',
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
  PersonalTraining: { screen: PersonalTraining },
  Friends: {screen: Friends},
  Chat: {screen: chats, navigationOptions: {tabBarLabel: 'Chats'}},
	Profile: {screen: Profile},
}, {
  tabBarPosition: 'bottom',
  animationEnabled: true,
  navigationOptions: {
      gesturesEnabled: false,
    },
  tabBarOptions: {
    activeTintColor: colors.primary,
    inactiveTintColor: color(colors.secondary).lighten(0.3).hex(),
    style: { backgroundColor: '#fff' },
    indicatorStyle: { backgroundColor: colors.primary },
    showIcon: true,
    //showLabel: false,
  },
})

export const Stack = StackNavigator({
  Login : { screen: Login, navigationOptions: {header: null} },
  SessionType: { screen: SessionType, navigationOptions: {tabBarVisible: false} },
  SessionDetail: { screen: SessionDetail, navigationOptions: {tabBarVisible: false} },
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
  FullScreenVideo: {screen: FullScreenVideo, navigationOptions: { header: null}}
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
          firebase.database().ref('users/' + user.uid).child('state').set(true)
        }
        else {
          firebase.database().ref('users/' + user.uid).child('state').set('away')
        }
      }
    }

  render () {
    const { nav, dispatch } = this.props
    return <Stack navigation={addNavigationHelpers({ dispatch, state:nav, addListener })} />
  }
}



export default connect(({nav})=>({nav}))(App)






