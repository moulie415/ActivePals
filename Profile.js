import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from './index'

 export default class Profile extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='person'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
  }

  componentDidMount() {
    this.isLoggedIn = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.navigate('Login');
      }
    })  
  }

  componentWillUnMount() {
    this.isLoggedIn()
  } 

  navigate(route) {
    this.props.navigation.navigate(route)
  }

  render () {
    return (
    <Container>
    <Button
    onPress={()=> this.logout()}>
    <Text>Log out</Text>
    </Button>
    </Container>
  )
  }

  logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
      Alert.alert(error.toString())
    })
  }
}
