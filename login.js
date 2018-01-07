import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import * as firebase from "firebase"
import  styles  from './styles/loginStyles'
import {GoogleSignin } from 'react-native-google-signin'
const FBSDK = require('react-native-fbsdk')
const { LoginManager, AccessToken } = FBSDK


 export default class App extends Component {

  constructor(props) {
    super(props)

    this.username = ""
    this.pass = ""
    this.user = null
  }

  componentDidMount() {
   let config = {
    apiKey: "AIzaSyDIjOw0vXm7e_4JJRbwz3R787WH2xTzmBw",
    authDomain: "anyone-80c08.firebaseapp.com",
    databaseURL: "https://anyone-80c08.firebaseio.com",
    projectId: "anyone-80c08",
    storageBucket: "anyone-80c08.appspot.com",
    messagingSenderId: "680139677816"
  }
  firebase.initializeApp(config)

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
      <Item rounded style={styles.inputGrp}>
      <Icon name="mail" style={{color: "#fff"}} />
        <Input
        placeholder="Email"
        onChangeText={u => this.username = u}
        placeholderTextColor="#fff"
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        //value={this.state.username}
        keyboardType={'email-address'}
        />
        </Item>
      <Item rounded style={styles.inputGrp}>
      <Icon name="unlock" style={{color: "#fff"}}/>
      <Input
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor="#FFF"
        onChangeText={p => this.pass = p}
        style={styles.input}
        />
        </Item>
        <View style={{flexDirection: 'row', marginVertical: 10}}>
      <Button primary rounded
        onPress={() => this.login(this.username, this.pass)}
        style={{marginRight: 10, width: 100, justifyContent: 'center'}}
        >
        <Text>Login</Text>
        </Button>
      <Button primary rounded
        onPress={() => this.props.navigation.navigate("SignUp")}
        style={{width: 100, justifyContent: 'center'}}
        >
        <Text>Sign Up</Text>
        </Button>
        </View>
        <Button rounded
        onPress={()=> this.fbLogin()}
        style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#3b5998", width: 250}}>
        <Icon name="logo-facebook"/>
        <Text style={{marginLeft: -20}}>Login with Facebook</Text>
        </Button>
        <Button rounded
        onPress={()=> this.gLogin()}
        style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#ea4335", width: 250}}>
        <Icon name="logo-google"/>
        <Text style={{marginLeft: -20}}>Login with Google</Text>
        </Button>
    </Container>
  )
  }


  async login(email, pass) {
    
    try {
        await firebase.auth()
            .signInWithEmailAndPassword(email, pass);

        console.log("Logged In!")
        Alert.alert("logged in")

        // Navigate to the Home page

    } catch (error) {
        Alert.alert(error.toString())
    }

}

fbLogin() {
   LoginManager.logInWithReadPermissions(['public_profile', 'email'])
        .then((result) => this._handleCallBack(result),
          function(error) {
            alert('Login fail with error: ' + error);
          }
        )
}

 _handleCallBack(result){
    let _this = this
    if (result.isCancelled) {
      alert('Login cancelled');
    } else {   
  AccessToken.getCurrentAccessToken().then(
          (data) => {
          
            const token = data.accessToken
            fetch('https://graph.facebook.com/v2.8/me?fields=id,first_name,last_name,gender,birthday&access_token=' + token)
            .then((response) => response.json())
            .then((json) => {
          
              // const imageSize = 120
              // const facebookID = json.id
              // const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`
             this.authenticate(data.accessToken)
              .then(function(result){
                const { uid } = result               
                _this.createUser(uid,json,token)
              })
 
 
            })
            .catch(function(err) {
                console.log(err);
            });
          }
        )
 
    }
  }

  authenticate = (token) => {
    const provider = firebase.auth.FacebookAuthProvider
    const credential = provider.credential(token)
    let ret = firebase.auth().signInWithCredential(credential)
    return ret;
  }
  createUser = (uid,userData,token) => {
    const defaults = {
      uid,
      token
    }
    firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })
   
  }

  gLogin() {
    GoogleSignin.configure({}).then(() => {
      GoogleSignin.hasPlayServices({ autoResolve: true })
        .then(() => {
          GoogleSignin.signIn()
            .then(user => {
              console.log(user);

              const credential = firebase.auth.GoogleAuthProvider.credential(
                user.idToken,
                user.accessToken
              );

              firebase
                .auth()
                .signInWithCredential(credential)
                .then(user => {
                  console.log("user firebase ", user);
                  if (user._authObj.authenticated) {
                    // do you login action here
                    // dispatch({
                    //  type: LOGIN_SUCCESS,
                    //  payload: { ...user._user, loggedIn: true }
                    //});
                  }
                });
            })
            .catch(err => {
              console.log("WRONG SIGNIN", err.message)
              Alert.alert("Wrong sign in", err.message)
            })
            .done();
        })
        .catch(err => {
          console.log("Play services error", err.code, err.message)
          Alert.alert("Play services error", err.code, err.message)
        });
   });

  }

}
