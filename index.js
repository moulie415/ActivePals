
import React from "react"
import { AppRegistry } from 'react-native'
import { StackNavigator } from "react-navigation"
import App from './login'
import SignUp from './SignUp'
import SecondScreen from "./SecondScreen"


const reactNavigationSample = props => {
  return <App navigation={props.navigation} />;
};

reactNavigationSample.navigationOptions = {
  title: "Login"
};

const SimpleApp = StackNavigator({
  Home: { screen: reactNavigationSample },
  SignUp: { screen: SignUp},
  SecondScreen: { screen: SecondScreen, title: "Second Screen" }
});

AppRegistry.registerComponent('Anyone', () => SimpleApp);
