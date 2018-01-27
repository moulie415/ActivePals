
import React from "react"
import { AppRegistry } from 'react-native'
import { StackNavigator } from "react-navigation"
import { TabNavigator } from "react-navigation"
import Login from './login'
import SignUp from './SignUp'
import Home from './Home'
import Friends from './Friends'
import Profile from './Profile'
import Settings from './Settings'
import Chat from './Chat'
import SecondScreen from "./SecondScreen"
import SessionType from './sessions/SessionType'
import SessionDetail from './sessions/SessionDetail'
import * as firebase from "firebase"
import { Root } from 'native-base'
import colors from 'Anyone/constants/colors'
import color from 'color'

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

const App = props => {
  return <Root><Login navigation={props.navigation} /></Root>
}

App.navigationOptions = {
  title: ""
}
const sessions = StackNavigator({
  Home : {screen: Home},
  SessionType: { screen: SessionType, navigationOptions: {/*tabBarVisible: false*/} },
  SessionDetail: { screen: SessionDetail, navigationOptions: {/*tabBarVisible: false*/} },
},{
  mode: 'modal',
  headerMode: 'none'
})

const tabs = TabNavigator({
	Home : {screen: sessions},
  Friends: {screen: Friends},
  Chat: {screen: Chat},
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
    showLabel: false
  },
})

const SimpleApp = StackNavigator({
  Login : { screen: App, navigationOptions: {header: null} },
  SignUp: { screen: SignUp},
  MainNav: { screen: tabs},
  SecondScreen: { screen: SecondScreen, title: "Second Screen" }
})


// const sessionNav = StackNavigator({

// })



AppRegistry.registerComponent('Anyone', () => SimpleApp);
