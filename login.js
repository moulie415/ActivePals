import React, { Component } from "react"
import { StyleSheet, Alert, View } from "react-native"
import { 
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Spinner,
} from 'native-base'
import firebase from "./index"
import  styles  from './styles/loginStyles'
import { GoogleSignin } from 'react-native-google-signin'
const FBSDK = require('react-native-fbsdk')
const { LoginManager, AccessToken } = FBSDK


 export default class Login extends Component {


  constructor(props) {
    super(props)

    this.username = ""
    this.pass = ""
    this.state = {
      user: null,
      spinner: false,
    }
    const navigation = props.navigation
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user && user.emailVerified) {
          this.props.navigation.navigate('Home')
      }
    })  
  }



  render () {
    return (
    <Container style={styles.container}>
      {this.state.spinner && <Spinner />}
      <Item style={styles.inputGrp}>
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
      <Item style={styles.inputGrp}>
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
      <Button primary
        onPress={() => {
          this.setState({spinner: true})
          this.login(this.username, this.pass)
        }}
        style={[{marginRight: 10}, styles.button]}
        >
        <Text style={{fontFamily: 'Avenir'}}>Login</Text>
        </Button>
      <Button primary
        onPress={() => this.props.navigation.navigate("SignUp")}
        style={styles.button}
        >
        <Text style={{fontFamily: 'Avenir'}}>Sign Up</Text>
        </Button>
        </View>
        <Button 
        onPress={()=> {
          this.fbLogin(this.props.navigation)
        }}
        style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#3b5998", width: 250}}>
        <Icon name="logo-facebook"/>
        <Text style={{marginLeft: -20, fontFamily: 'Avenir'}}>Login with Facebook</Text>
        </Button>
        <Button 
        onPress={()=> {
          this.gLogin()
        }}
        style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#ea4335", width: 250}}>
        <Icon name="logo-google"/>
        <Text style={{marginLeft: -20, fontFamily: 'Avenir'}}>Login with Google</Text>
        </Button>
    </Container>
  )
  }

  


  async login(email, pass) {
    try {
      await firebase.auth()
      .signInWithEmailAndPassword(email, pass).then(user => {
        if (user.emailVerified) {
         Alert.alert("Success", "Logged in as: " + user.email)
         this.props.navigation.navigate('Home')
       }
       else {
        Alert.alert('Sorry', 'You must first verify your email using the link we sent you before logging in')
       }
       console.log("Logged In!")


      })

      this.setState({spinner: false})


        // Navigate to the Home page

      } catch (error) {
        this.setState({spinner: false})
        Alert.alert(error.toString())
      }
    }

    fbLogin(navigation) {
      LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => this._handleCallBack(result, navigation),
        function(error) {
          alert('Login fail with error: ' + error);
        }
        )
    }


 _handleCallBack(result, navigation){
    let _this = this
    if (result.isCancelled) {
      Alert.alert("Facbook login", "cancelled")
    } else {   
  AccessToken.getCurrentAccessToken().then(
          (data) => {
          
            const token = data.accessToken
            fetch('https://graph.facebook.com/v2.8/me?fields=id,email,first_name,last_name,gender,birthday&access_token=' + token)
            .then((response) => response.json())
            .then((json) => {
          
              // const imageSize = 120
              // const facebookID = json.id
              // const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`
             this.authenticate(data.accessToken)
             .then(function(result){
              if (result.emailVerified) {
                navigation.navigate('Home')
              }
              else {
               result.sendEmailVerification().then(()=> {
                 Alert.alert("Account created", "You must now verify your email using the link we sent you before you can login")
               }).catch(error => {
                Alert.alert('Error', error.message)
              })
             }
             const { uid } = result  
                _this.createUser(uid,json,token)
              })
              .catch(error => {
                Alert.alert('Error', error.message)
              })
 
 
            })
            .catch(error => {
              Alert.alert('Error', error.message)
            })
          }
        )
 
    }
  }

  authenticate = (token) => {
    const provider = firebase.auth.FacebookAuthProvider
    const credential = provider.credential(token)
    let ret = firebase.auth().signInWithCredential(credential)
    return ret
  }
  createUser = (uid,userData,token) => {
    const defaults = {
      uid,
      token
    }
    firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })
   
  }

  gLogin() {
    GoogleSignin.configure({
      iosClientId: '680139677816-3eoc0cs830fbns898khlh01e6f685k1u.apps.googleusercontent.com'
    }).then(() => {
      GoogleSignin.hasPlayServices({ autoResolve: true })
        .then(() => {
          GoogleSignin.signIn()
            .then(user => {
              console.log(user)

              const credential = firebase.auth.GoogleAuthProvider.credential(
                user.idToken,
                user.accessToken
              );

              firebase
                .auth()
                .signInWithCredential(credential)
                .then(user => {
                  console.log("user firebase ", user)
                  let text = user.displayName? user.displayName : user.email 
                  let userData = {uid: user.uid, email: user.email, token: user.refreshToken}
                  this.createUser(user.uid, userData, user.refreshToken)

                  if (user.emailVerified) {
                   Alert.alert("Success", "Logged in as: " + text)
                 }
                 else {
                   user.sendEmailVerification().then(()=> {
                     Alert.alert("Account created", "You must now verify your email using the link we sent you before you can login")
                   }).catch(error => {
                    Alert.alert('Error', error.message)
                  })
                 }

                  //if (user._authObj.authenticated) { THIS LINE DOES NOT WORK 
                    // do you login action here
                    // dispatch({
                    //  type: LOGIN_SUCCESS,
                    //  payload: { ...user._user, loggedIn: true }
                    //});
                  //}
                });
            })
            .catch(err => {
              console.log("WRONG SIGNIN", err.message)
              Alert.alert("Wrong sign in", err.message)
            })
            .done()
        })
        .catch(err => {
          console.log("Play services error", err.code, err.message)
          Alert.alert("Play services error", err.code, err.message)
        })
   })
  }

   logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
      Alert.alert(error.toString())
    })
  }

}
