import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from './index'
import  styles  from './styles/loginStyles'

 export default class Profile extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-person'
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

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.props.navigation.navigate('Login');
      }
      else {
        this.setState({email: user.email, username: user.displayName })
      }
    })  
  }


  render () {
    return (
    <Container>
    
        <Icon name="mail" style={{color: "#fff"}} />
      <Text>Email: {this.state.email}</Text>
      <Item rounded style={styles.inputGrp}>
        <Icon name="mail" style={{color: "#fff"}} />
      <Text>Username: </Text>
          <Input
          placeholder="Username"
          onChangeText={u => this.username = u}
          placeholderTextColor="#fff"
          style={styles.input}
          autoCapitalize={'none'}
          autoCorrect={false}
          value={this.state.username}
              //keyboardType={'email-address'}
              />
          </Item>
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
