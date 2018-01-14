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
      if (user) {
        this.user = user
      }
    })
  }


  render () {
    //switch for list view and map view
    //action sheet when pressing 
    return (
      <Container>
        <Button
        onPress={()=> this.logout()}>
          <Text>Create Session</Text>
        </Button>
        <Button
        onPress={()=> this.logout()}>
          <Text>Create Private Session</Text>
        </Button>
      </Container>
      )
  }
}
