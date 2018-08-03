import React, { Component } from "react"
import { StyleSheet, Alert } from "react-native"
import {
  Button,
  Input,
  Container,
  Item,
  Icon,
  Spinner
} from 'native-base'
import firebase from 'react-native-firebase'
import  styles  from './styles/signUpStyles'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'

 class SignUp extends Component {

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
                  this.setState({spinner: false})
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
            Alert.alert('Please try again', 'Passwords do not match')
            this.setState({spinner: false})
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
           Alert.alert('Account created', 'You must now verify your email using the link we sent you before you can login')
           this.setState({spinner: false})
         }).catch(error => {
          Alert.alert('Error', error.message)
        this.setState({spinner: false})
        })
       }).catch(error => {
        console.log(error)
        Alert.alert('Error', error.message)
        this.setState({spinner: false})
      })
      } catch (error) {
        console.log(error.toString())
        this.setState({spinner: false})
        Alert.alert(error.toString())
      }

}

createUser = (uid,userData,token) => {
  firebase.database().ref('admins').child(uid).once('value', snapshot => {
    const defaults = {
      uid,
      token,
      accountType: snapshot.val() ? 'admin' : 'standard',
    }
    //Alert.alert("Success", "Logged in as: " + userData.email)
    firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })
    if (this.username) {
      firebase.database().ref('usernames').child(this.username).set(uid)
    }
})
  }

}

import { connect } from 'react-redux'
// const mapStateToProps = ({ home, settings, profile }) => ({
// })

// const mapDispatchToProps = dispatch => ({
// })

export default connect(null, null)(SignUp)
