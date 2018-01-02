import React, { Component } from "react"
import { StyleSheet, Text, Button, View } from "react-native"
import { StackNavigator } from "react-navigation"
import * as firebase from "firebase"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
})

 export default class App extends Component {

  componentDidMount() {
   let config = {
    apiKey: "AIzaSyDIjOw0vXm7e_4JJRbwz3R787WH2xTzmBw",
    authDomain: "anyone-80c08.firebaseapp.com",
    databaseURL: "https://anyone-80c08.firebaseio.com",
    projectId: "anyone-80c08",
    storageBucket: "anyone-80c08.appspot.com",
    messagingSenderId: "680139677816"
  }
  firebase.initializeApp(config)
}

  render () {
    return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome to React Native Navigation Sample!
      </Text>
      <Button
        onPress={() => this.props.navigation.navigate("SecondScreen")}
        title="Go to Second Screen"
      />
    </View>
  )
  }
}