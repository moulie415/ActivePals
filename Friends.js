import React, { Component } from "react"
import { StyleSheet, Alert, View, TouchableOpacity } from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Title,
  Right,
  Left
} from 'native-base'
import firebase from "./index"


 export default class Friends extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Friends',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='people'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
  }

  componentDidMount() {

  firebase.auth().onAuthStateChanged(user => {
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
      <Header>  
        <Left style={{flex: 1}}/>
        <Title style={{alignSelf: 'center', flex: 1 }}>Friends</Title>
        <Right style={{flex: 1}}>
          <TouchableOpacity>
            <Icon name='add' style={{color: '#fff'}} />
          </TouchableOpacity>
        </Right>
      </Header>

    </Container>
  )
  }
}
