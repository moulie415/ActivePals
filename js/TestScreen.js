import React, { Component } from "react"
import { StyleSheet, Text, View } from "react-native"
import { GooglePlacesInput } from './Sessions'

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
  }
});

export default class TestScreen extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      GooglePlacesInput()
      )
  }
}

TestScreen.navigationOptions = {
  title: "Test Screen Title"
};

