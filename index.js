
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
import * as firebase from "firebase"
import { Root } from 'native-base'

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
  return <Login navigation={props.navigation} />;
}

App.navigationOptions = {
  title: "Login"
}

const tabs = TabNavigator({
	Home : {screen: Home},
  Friends: {screen: Friends},
  Chat: {screen: Chat},
	Profile: {screen: Profile},
	Settings: {screen: Settings}
}, {
  tabBarPosition: 'bottom',
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: '#e91e63',
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
