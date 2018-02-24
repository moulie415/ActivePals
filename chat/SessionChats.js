import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from '../index'
//import  styles  from './styles/loginStyles'

 export default class SessionChats extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Session Chats',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-chatboxes'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
    this.state = {
      email: "",
      username: ""
    }
  }

  //have dms and session chat tabs at top

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({email: user.email })
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