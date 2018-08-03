import React, { Component } from "react"
import { Alert, View, ImageBackground } from "react-native"
import {
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Spinner,
} from 'native-base'
import firebase from 'react-native-firebase'
import  styles  from './styles/loginStyles'
import { GoogleSignin } from 'react-native-google-signin'
import VersionNumber from 'react-native-version-number'
const FBSDK = require('react-native-fbsdk')
const { LoginManager, AccessToken } = FBSDK
const background = require('Anyone/assets/images/Running-background.jpg')
import colors from 'Anyone/js/constants/colors'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import SplashScreen from 'react-native-splash-screen'
import RNFetchBlob from 'rn-fetch-blob'


 class Login extends Component {


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
    SplashScreen.hide()
    firebase.auth().onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        this.setState({spinner: true})
        this.props.onLogin()
      }
    })
    // if (this.props.loggedIn) {
    //   this.props.goHome()
    // }
  }



  render () {
    return (
    <ImageBackground style={styles.container} source={background}>
      {this.state.spinner && <Spinner color={colors.secondary}/>}
      <View style={{marginBottom: 40}}>
        <Text style={{color: colors.secondary, fontSize: 40, textAlign: 'center', fontWeight: 'bold'}}>F I T</Text>
        <Text style={{color: colors.secondary, fontSize: 40, textAlign: 'center', fontWeight: 'bold'}}>L I N K</Text>
      </View>
      <Item style={styles.inputGrp}>
      <Icon name="mail" style={{color: '#fff'}} />
        <Input
        placeholder="Email"
        onChangeText={u => this.username = u}
        placeholderTextColor={'#fff'}
        style={styles.input}
        autoCapitalize={'none'}
        autoCorrect={false}
        //value={this.state.username}
        keyboardType={'email-address'}
        />
        </Item>
      <Item style={styles.inputGrp}>
      <Icon name="unlock" style={{color: '#fff'}}/>
      <Input
        placeholder="Password"
        secureTextEntry={true}
        placeholderTextColor={'#fff'}
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
        <Text style={{color: '#fff'}}>Login</Text>
        </Button>
      <Button primary
        onPress={() => this.props.navigation.navigate("SignUp")}
        style={styles.button}
        >
        <Text style={{color: '#fff'}}>Sign Up</Text>
        </Button>
        </View>
        <View>
          <Button
          onPress={()=> {
            this.fbLogin(this.props.navigation)
          }}
          style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#3b5998", width: 250}}>
            <Icon name="logo-facebook"/>
            <Text style={{color: '#fff'}}>Login with Facebook</Text>
          </Button>
          <Button
          onPress={()=> {
            this.gLogin()
          }}
          style={{alignSelf: 'center', justifyContent: 'center', marginVertical: 10, backgroundColor: "#ea4335", width: 250}}>
            <Icon style={{marginLeft: 0}} name="logo-google"/>
            <Text style={{ color: '#fff'}}>Login with Google</Text>
          </Button>
        </View>
          <Text style={{color: '#fff', textAlign: 'center', position: 'absolute', bottom: 10}}>
          {'v' + VersionNumber.appVersion}</Text>
    </ImageBackground>
  )
  }


  async login(email, pass) {
    try {
      await firebase.auth()
      .signInWithEmailAndPassword(email, pass).then(user => {
        if (user.emailVerified) {
          this.props.onLogin()
       }
       else {
        Alert.alert('Sorry', 'You must first verify your email using the link we sent you before logging in')
       }
       console.log('Logged In!')
      })
      this.setState({spinner: false})
        //Navigate to the Home page
      } catch (error) {
        this.setState({spinner: false})
        Alert.alert(error.toString())
      }
    }

    fbLogin(navigation) {
      LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => this._handleCallBack(result, navigation),
        function(error) {
          alert('Login fail with error: ' + error)
        }
        )
    }


 _handleCallBack(result, navigation){
    let _this = this
    if (result.isCancelled) {
      //Alert.alert('Facbook login', 'cancelled')
    } else {
  AccessToken.getCurrentAccessToken().then(
          (data) => {
            const token = data.accessToken
            fetch('https://graph.facebook.com/v2.8/me?fields=id,email,first_name,last_name,gender,birthday&access_token=' + token)
            .then((response) => response.json())
            .then((json) => {

              const imageSize = 200
              const facebookID = json.id
              const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`
             this.authenticate(data.accessToken)
             .then(function(result){
              if (result.emailVerified) {
                _this.props.onLogin()
              }
              else {
               result.sendEmailVerification().then(()=> {
                 Alert.alert("Account created", "You must now verify your email using the link we sent you before you can login")
                 const imageRef = firebase.storage().ref('images/' + result.uid).child('avatar')
                 RNFetchBlob.fetch('GET', fbImage).then(image => image.blob())
                 .then(blob => {
                  imageRef.put(blob)
                 })
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
    firebase.database().ref('admins').child(uid).once('value', snapshot => {
      const defaults = {
        uid,
        token,
        accountType: snapshot.val() ? 'admin' : 'standard',
      }
      firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })

    })
  }

  gLogin() {
    GoogleSignin.configure({
      iosClientId: '680139677816-3eoc0cs830fbns898khlh01e6f685k1u.apps.googleusercontent.com'
    }).then(() => {
      GoogleSignin.hasPlayServices({ autoResolve: true })
        .then(() => {
          GoogleSignin.signIn()
            .then(user => {
              this.setState({spinner: true})
              console.log(user)

              const credential = firebase.auth.GoogleAuthProvider.credential(
                user.idToken,
                user.accessToken
              )

              firebase
                .auth()
                .signInWithCredential(credential)
                .then(user => {
                  console.log("user firebase ", user)
                  let userData = {uid: user.uid, email: user.email, token: user.refreshToken}
                  this.createUser(user.uid, userData, user.refreshToken)

                  if (user.emailVerified) {
                 }
                 else {
                   user.sendEmailVerification().then(()=> {
                     Alert.alert('Account created', 'You must now verify your email using the link we sent you before you can login')
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


import { connect } from 'react-redux'
import { navigateLogin, navigateHome } from 'Anyone/js/actions/navigation'
import { doSetup, fetchProfile, setHasLoggedIn } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ home, settings, profile }) => ({
  loggedIn: profile.loggedIn,
})

const mapDispatchToProps = dispatch => ({
  onLogoutPress: ()=> { dispatch(navigateLogin())},
  onLogin: ()=> {dispatch(fetchProfile()).then(profile => {
    dispatch(doSetup(profile))
  })},
  goHome: ()=> dispatch(navigateHome())
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
