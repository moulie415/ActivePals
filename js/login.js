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
import TouchableOpacity from './constants/TouchableOpacityLockable.js'


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
      if (user && user.emailVerified && !this.state.waitForData) {
        this.setState({spinner: true})
        firebase.auth().fetchSignInMethodsForEmail(user.email).then(providers => {
        this.setState({spinner: false})
          if (providers.length > 0) {
            this.props.onLogin()
          }
          else if (this.props.nav.index > 0) { 
              this.props.logout()
            }
        })
        .catch(e => console.log(e))
      }
    })
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
      <TouchableOpacity primary
        onPress={(mutex) => {
          mutex.lockFor(1000)
          this.setState({spinner: true})
          this.login(this.username, this.pass)
        }}
        style={[{marginRight: 10}, styles.button]}
        >
        <Text style={{color: '#fff'}}>Login</Text>
        </TouchableOpacity>
      <TouchableOpacity primary
        onPress={() => this.props.navigation.navigate("SignUp")}
        style={styles.button}
        >
        <Text style={{color: '#fff'}}>Sign Up</Text>
        </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
          onPress={(mutex)=> {
            mutex.lockFor(5000)
            this.fbLogin(this.props.navigation)
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,
            backgroundColor: "#3b5998",
            width: 250,
            flexDirection: 'row',
            paddingVertical: 8,
            borderRadius: 2
          }}>
            <Icon style={{color: '#fff', marginRight: 10}} name="logo-facebook"/>
            <Text style={{color: '#fff'}}>Login with Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={(mutex)=> {
            mutex.lockFor(5000)
            this.gLogin()
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,
            backgroundColor: "#ea4335",
            width: 250,
            flexDirection: 'row',
            paddingVertical: 8,
            borderRadius: 2
          }}>
            <Icon style={{marginLeft: -15, color: '#fff', marginRight: 10}} name="logo-google"/>
            <Text style={{ color: '#fff'}}>Login with Google</Text>
          </TouchableOpacity>
        </View>
          <Text style={{color: colors.primary, textAlign: 'center', position: 'absolute', bottom: 10}}>
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
    this.setState({spinner: true})
    let _this = this
    if (result.isCancelled) {
      //Alert.alert('Facbook login', 'cancelled')
      this.setState({spinner: false})
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
              const { uid } = result.user
              if (!result.additionalUserInfo.isNewUser) {
                _this.props.onLogin()
              }
              else {
                 const imageRef = firebase.storage().ref('images/' + uid).child('avatar')
                 RNFetchBlob.fetch('GET', fbImage).then(image => image.blob())
                 .then(blob => {
                  imageRef.putFile(blob._ref).then(() => {
                    _this.createUser(uid,json,token).then(() => {
                      _this.props.onLogin()
                    })
                  })
                 })
                 .catch(e => {
                   console.log(e)
                   _this.createUser(uid,json,token).then(() => {
                    _this.props.onLogin()
                  })
                })
             }
                _this.createUser(uid,json,token)
              })
              .catch(error => {
                Alert.alert('Error', error.message)
                this.setState({spinner: false})
              })
            })
            .catch(error => {
              Alert.alert('Error', error.message)
              this.setState({spinner: false})
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
    return new Promise(resolve => {
      firebase.database().ref('admins').child(uid).once('value', snapshot => {
        const defaults = {
          uid,
          token,
          accountType: snapshot.val() ? 'admin' : 'standard',
        }
        firebase.database().ref('users').child(uid).update({ ...userData, ...defaults })
        .then(() => {
          resolve()
        })

      })

    })
  }

  gLogin() {
    this.setState({waitForData: true, spinner: true})
    GoogleSignin.configure({
      iosClientId: '680139677816-3eoc0cs830fbns898khlh01e6f685k1u.apps.googleusercontent.com',
      webClientId: '680139677816-fp071bo61qp0dfk5olqu4tke2477u6jc.apps.googleusercontent.com'
    }).then(() => {
      GoogleSignin.hasPlayServices({ autoResolve: true })
        .then(() => {
          GoogleSignin.signIn()
            .then(user => {
              console.log(user)
              let first_name = user.givenName
              let last_name = user.familyName

              const credential = firebase.auth.GoogleAuthProvider.credential(
                user.idToken,
                user.accessToken
              )

              firebase
                .auth()
                .signInAndRetrieveDataWithCredential(credential)
                .then(result => {
                  let user = result.user
                  console.log("user firebase ", user)
                  let userData = {uid: user.uid, email: user.email, token: user.token, last_name, first_name }
                  this.createUser(user.uid, userData, user.token).then(() => {
                    if (result.additionalUserInfo && result.additionalUserInfo.isNewUser && user.photoURL) {
                      const imageRef = firebase.storage().ref('images/' +  user.uid).child('avatar')
                      RNFetchBlob.fetch('GET', user.photoURL).then(image => image.blob())
                      .then(blob => {
                        imageRef.putFile(blob._ref).then(() => {
                          this.checkForVerification(user)
                        })
                      })
                      .catch(e => {
                        console.log(e)
                        this.checkForVerification(user)
                      })
                    }
                    else {
                      this.checkForVerification(user)
                    }
                  })

                  //if (user._authObj.authenticated) { THIS LINE DOES NOT WORK
                    // do you login action here
                    // dispatch({
                    //  type: LOGIN_SUCCESS,
                    //  payload: { ...user._user, loggedIn: true }
                    //});
                  //}
                });
            })
            .catch(e => {
              console.log(e)
              Alert.alert('Error', "Code: " + e.code)
            })
            .done()
        })
        .catch(err => {
          console.log("Play services error", err.code, err.message)
          Alert.alert("Play services error", err.code, err.message)
        })
   })
  }

  checkForVerification(user) {
    if (!user.emailVerified) {
     user.sendEmailVerification().then(()=> {
       Alert.alert('Account created', 'You must now verify your email using the link we sent you before you can login')
     }).catch(error => {
      Alert.alert('Error', error.message)
    })
   }
   else {
    this.props.onLogin()
   }
   this.setState({waitForData: false})
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
import { doSetup, fetchProfile, setHasLoggedIn, setLoggedOut } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ home, settings, profile, nav }) => ({
  loggedIn: profile.loggedIn,
  nav,
})

const mapDispatchToProps = dispatch => ({
  onLogoutPress: ()=> { dispatch(navigateLogin())},
  onLogin: ()=> {dispatch(fetchProfile()).then(profile => {
    dispatch(doSetup(profile))
  })},
  logout: () => {
    dispatch(navigateLogin())
    dispatch(setLoggedOut())
  },
  goHome: ()=> dispatch(navigateHome())
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
