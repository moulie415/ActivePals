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
  Content
} from 'native-base'
import * as firebase from "firebase"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#002b31"
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
  },
  input: {
    color: '#fff'
  },
  inputGrp: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
    borderWidth: 0,
    borderColor: 'transparent',
  },
})

 export default class SignUp extends Component {

  constructor(props) {
    super(props)

    this.user = ""
    this.pass = ""
  }

  componentDidMount() {
  }

  render () {
    return (
    <Container style={styles.container}>
      <Item rounded style={styles.inputGrp}>
        <Input
        placeholder="Username"
        onChangeText={u => this.user = u}
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
      <Button primary rounded
        onPress={() => this.signup(this.user, this.pass)}
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

        console.log("Account created");
        Alert.alert("account created")
      } catch (error) {
        console.log(error.toString())
      }

} 

} 
