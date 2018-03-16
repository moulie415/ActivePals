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
    this.email = ""
    this.pass = ""
    this.confirm = ""
    this.state = {
      spinner: false
    }
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
    <Container style={styles.container}>
      {this.state.spinner && <Spinner />}
      <Item rounded style={styles.inputGrp}>
      <Icon name="person" style={{color: "#fff"}} />
        <Input
        placeholder="Username (optional)"
        onChangeText={u => this.username = u}
        placeholderTextColor="#FFF"
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        keyboardType={'email-address'}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Icon name="mail" style={{color: "#fff"}} />
        <Input
        placeholder="Email"
        onChangeText={e => this.email = e}
        placeholderTextColor="#FFF"
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        keyboardType={'email-address'}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Icon name="unlock" style={{color: "#fff"}} />
      <Input
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#FFF"
        onChangeText={p => this.pass = p}
        style={styles.input}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Icon name="unlock" style={{color: "#fff"}} />
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
            if (this.username) {
              firebase.database().ref('/usernames/' + this.username).once('value')
              .then(snapshot => {
                if (snapshot.val()) {
                  Alert.alert('Sorry', 'That username is already in use')
                }
                else {
                  this.signup(this.email, this.pass)
                }
              }) 
            }
            else {
              this.signup(this.email, this.pass)
            }
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
        .createUserWithEmailAndPassword(email, pass).then(user => {
         let userData = {uid: user.uid, email: user.email, username: this.username}
         this.createUser(user.uid, userData, "")
         user.sendEmailVerification().then(()=> {
           Alert.alert("Account created", "You must now verify your email using the link we sent you before you can login")
         }).catch(error => {
          Alert.alert('Error', error.message)
        })
       }).catch(error => {
        console.log(error)
        Alert.alert('Error', error.message)
      })

        this.setState({spinner: false})
        

      } catch (error) {
        console.log(error.toString())
        this.setState({spinner: false})
        Alert.alert(error.toString())
      }

} 

createUser = (uid,userData,token) => {
    const defaults = {
      uid,
      token,
      accountType: 'standard'
    }
    //Alert.alert("Success", "Logged in as: " + userData.email)
    firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })
    if (this.username) {
      firebase.database().ref('usernames').child(this.username).set(uid)
    } 
  }

} 
