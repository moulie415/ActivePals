import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from "./index"


 export default class Settings extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Settings',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-settings'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
  }

  componentDidMount() {

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    this.user = user
    // User is signed in.
  } else {
    // No user is signed in.
  }
})
}

  render () {
    return (
    <Container>
    </Container>
  )
  }
}
