import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from "./index"


 export default class Home extends Component {

 static navigationOptions = {
    header: null,
    tabBarLabel: 'Home',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='home'
        style={{ color: tintColor }}
      />
    ),
  }
  constructor(props) {
    super(props)

    this.user = null
    this.state = {
      username: 'no username'
    }
  }

  componentDidMount() {


  firebase.auth().onAuthStateChanged( user => {
    if (user.email) {
      this.setState({email: user.email})
    }
    if (user.displayName) {
      this.setState({username: user.displayName})
    }
    })
}

componentDidUnMount() {

}

  render () {
    return (
    <Container>
    <Text>{this.state.email}</Text>
    <Text>{this.state.username}</Text>
      <Button>

      </Button>
    </Container>
  )
  }
}
