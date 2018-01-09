
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
import SecondScreen from "./SecondScreen"


const App = props => {
  return <Login navigation={props.navigation} />;
};

App.navigationOptions = {
  title: "Login"
}

const tabs = TabNavigator({
	Home : {screen: Home},
	Profile: {screen: Profile},
	Friends: {screen: Friends},
	Settings: {screen: Settings}
}, {
  tabBarPosition: 'bottom',
  animationEnabled: true,
  tabBarOptions: {
    activeTintColor: '#e91e63',
    showIcon: true
  },
})

const SimpleApp = StackNavigator({
  Login : { screen: App },
  SignUp: { screen: SignUp},
  MainNav: { screen: tabs},
  SecondScreen: { screen: SecondScreen, title: "Second Screen" }
})



AppRegistry.registerComponent('Anyone', () => SimpleApp);
