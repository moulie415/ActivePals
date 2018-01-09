import React, { Component } from "react"
import { StyleSheet, Alert } from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Item,
  Header,
  Left,
  Icon,
  Body,
  Title,
  Right,
  Content,
  Spinner
} from 'native-base'
import * as firebase from "firebase"
import  styles  from './styles/signUpStyles'

 export default class SignUp extends Component {

  constructor(props) {
    super(props)

    this.username = ""
    this.pass = ""
    this.confirm = ""
    this.state = {
      spinner: false
    }
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
    <Container style={styles.container}>
      {this.state.spinner && <Spinner />}
      <Item rounded style={styles.inputGrp}>
        <Input
        placeholder="Email"
        onChangeText={u => this.username = u}
        placeholderTextColor="#FFF"
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        //value={this.state.username}
        keyboardType={'email-address'}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Input
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#FFF"
        onChangeText={p => this.pass = p}
        style={styles.input}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Input
        placeholder="Confirm Password"
        secureTextEntry={true}
        placeholderTextColor="#FFF"
        onChangeText={p => this.confirm = p}
        style={styles.input}
        />
        </Item>
        <Button primary rounded
        onPress={() => {
          if (this.pass == this.confirm) {
            this.setState({spinner: true})
            this.signup(this.username, this.pass)
          }
          else {
            Alert.alert("Please try again", "Passwords do not match")
          }
        }}
        style={{alignSelf: 'center'}}
        >
        <Text>Sign up</Text>
        </Button>
    </Container>
  )
  }

    async signup(email, pass) {

      try {
        await firebase.auth()
        .createUserWithEmailAndPassword(email, pass);

        this.setState({spinner: false})
        console.log("Account created");
        Alert.alert("account created")

      } catch (error) {
        console.log(error.toString())
        this.setState({spinner: false})
        Alert.alert(error.toString())
      }

} 

} 
