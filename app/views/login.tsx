import React, { Component } from 'react';
import { Alert, View, ImageBackground, Platform, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import { GoogleSignin } from 'react-native-google-signin';
import VersionNumber from 'react-native-version-number';
import SplashScreen from 'react-native-splash-screen';
import RNFetchBlob from 'rn-fetch-blob';
import SpinnerButton from 'react-native-spinner-button';
import { PulseIndicator } from 'react-native-indicators';
import { connect } from 'react-redux';
import Button from '../components/Button';
import { navigateLogin, navigateHome } from '../actions/navigation';
import { AccountType } from '../types/Profile';
import styles from '../styles/loginStyles';
import sStyles from '../styles/settingsStyles';
import colors from '../constants/colors';
import Text, { globalTextStyle } from '../components/Text';
import str from '../constants/strings';
import { doSetup, fetchProfile, setLoggedOut } from '../actions/profile';

const FBSDK = require('react-native-fbsdk');
const { LoginManager, AccessToken } = FBSDK;
const background = require('Anyone/assets/images/Running-background.jpg');

class Login extends Component {
  constructor(props) {
    super(props);
    this.username = '';
    this.pass = '';
    this.state = {
      user: null,
      spinner: false,
      secure: true,
      secondAuthChange: false,
    };
  }

  componentDidMount() {
    SplashScreen.hide();
    firebase.auth().onAuthStateChanged(user => {
      if (
        user &&
        (user.emailVerified || (user.providerData && user.providerData.length > 0)) &&
        !this.state.waitForData
      ) {
        /*ios onAuthStateChanged gets called twice so we want to account
        for this so that we don't have unnecessary calls*/
        if (this.state.secondAuthChange || Platform.OS != 'ios') {
          this.setState({ spinner: false });
          this.props.onLogin();
        } else {
          this.setState({ secondAuthChange: true });
        }
      } else if (this.props.loggedIn) {
        this.props.logout();
      }
    });
  }

  render() {
    return (
      <ImageBackground style={styles.container} source={background}>
        {this.state.spinner && (
          <View style={sStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ color: colors.secondary, fontSize: 40, textAlign: 'center', fontWeight: 'bold' }}>
            {str.appName}
          </Text>
        </View>
        <View style={styles.inputGrp}>
          <Icon size={25} name="md-mail" style={styles.icon} />
          <TextInput
            placeholder="Email"
            onChangeText={u => (this.username = u)}
            placeholderTextColor={'#fff'}
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
            //value={this.state.username}
            keyboardType={'email-address'}
          />
        </View>
        <View style={styles.inputGrp}>
          <Icon size={25} name="md-unlock" style={styles.icon} />
          <TextInput
            placeholder="Password"
            secureTextEntry={this.state.secure}
            placeholderTextColor={'#fff'}
            onChangeText={p => (this.pass = p)}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => this.setState({ secure: !this.state.secure })}>
            <Icon size={30} name={this.state.secure ? 'ios-eye' : 'ios-eye-off'} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <Button
            text="Login"
            onPress={() => {
              if (this.username && this.pass) {
                this.setState({ spinner: true, secure: true });
                this.login(this.username, this.pass);
              } else Alert.alert('Sorry', 'Please enter both your email and your password');
            }}
            style={[{ marginRight: 10 }, styles.button]}
          />
          <Button style={styles.button} onPress={() => this.props.navigation.navigate('SignUp')} text="Sign Up" />
        </View>
        <View>
          <SpinnerButton
            onPress={() => this.fbLogin()}
            isLoading={this.state.facebookLoading}
            spinnerType={str.spinner}
            buttonStyle={[{ backgroundColor: '#3b5998' }, styles.spinnerButton]}
          >
            <Icon size={25} style={{ color: '#fff', marginRight: 10 }} name="logo-facebook" />
            <Text style={{ color: '#fff' }}>Login with Facebook</Text>
          </SpinnerButton>
          <SpinnerButton
            isLoading={this.state.googleLoading}
            spinnerType={str.spinner}
            onPress={() => {
              this.setState({ googleLoading: true });
              this.gLogin();
            }}
            buttonStyle={[{ backgroundColor: '#ea4335' }, styles.spinnerButton]}
          >
            <Icon size={25} style={{ marginLeft: -15, color: '#fff', marginRight: 10 }} name="logo-google" />
            <Text style={{ color: '#fff' }}>Login with Google</Text>
          </SpinnerButton>
        </View>
        <Text style={{ color: colors.primary, textAlign: 'center', position: 'absolute', bottom: 10 }}>
          {'v' + VersionNumber.appVersion}
        </Text>
      </ImageBackground>
    );
  }

  async login(email, pass) {
    try {
      await firebase
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(({ info, user }) => {
          if (user.emailVerified) {
            this.props.onLogin();
          } else {
            this.setState({ spinner: false });
            Alert.alert('Sorry', 'You must first verify your email using the link we sent you before logging in');
          }
        });
      //Navigate to the Home page
    } catch (error) {
      this.setState({ spinner: false });
      Alert.alert(error.toString());
    }
  }

  fbLogin() {
    this.setState({ facebookLoading: true });
    LoginManager.logInWithPermissions(['public_profile', 'email', 'user_friends']).then(
      result => this.handleCallBack(result),
      function(error) {
        Alert.alert('Error', 'Login fail with error: ' + error);
      }
    );
  }

  handleCallBack(result) {
    if (result.isCancelled) {
      //Alert.alert('Facbook login', 'cancelled')
      this.setState({ facebookLoading: false });
    } else {
      AccessToken.getCurrentAccessToken().then(data => {
        const token = data.accessToken;
        fetch(
          'https://graph.facebook.com/v5.0/me?fields=id,email,first_name,last_name,gender,birthday&access_token=' +
            token
        )
          .then(response => response.json())
          .then(json => {
            json.fb_login = true;
            const imageSize = 200;
            const facebookID = json.id;
            const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`;
            this.authenticate(data.accessToken)
              .then(result => {
                const { uid } = result.user;
                firebase
                  .database()
                  .ref('fbusers')
                  .child(facebookID)
                  .set(uid);
                if (!result.additionalUserInfo.isNewUser) {
                  this.props.onLogin();
                } else {
                  const imageRef = firebase
                    .storage()
                    .ref('images/' + uid)
                    .child('avatar');
                  RNFetchBlob.fetch('GET', fbImage)
                    .then(image => image.blob())
                    .then(blob => {
                      imageRef.putFile(blob._ref).then(() => {
                        this.createUser(uid, json, token).then(() => {
                          this.props.onLogin();
                        });
                      });
                    })
                    .catch(e => {
                      console.log(e);
                      this.createUser(uid, json, token).then(() => {
                        this.props.onLogin();
                        this.setState({ facebookLoading: false });
                      });
                    });
                }
                this.createUser(uid, json, token);
              })
              .catch(error => {
                Alert.alert('Error', error.message);
                this.setState({ facebookLoading: false });
              });
          })
          .catch(error => {
            Alert.alert('Error', error.message);
            this.setState({ facebookLoading: false });
          });
      });
    }
  }

  authenticate = token => {
    const provider = firebase.auth.FacebookAuthProvider;
    const credential = provider.credential(token);
    return firebase.auth().signInWithCredential(credential);
  };

  createUser = (uid, userData, token) => {
    return new Promise(resolve => {
      firebase
        .database()
        .ref('admins')
        .child(uid)
        .once('value', snapshot => {
          const defaults = {
            uid,
            token,
            accountType: snapshot.val() ? AccountType.ADMIN : AccountType.STANDARD,
          };
          firebase
            .database()
            .ref('users')
            .child(uid)
            .update({ ...userData, ...defaults })
            .then(() => {
              resolve();
            });
        });
    });
  };

  async gLogin() {
    this.setState({ waitForData: true });
    const iosClientId = await firebase
      .database()
      .ref('ENV_VARS')
      .child('GOOGLE_IOS_ID')
      .once('value');
    const webClientId = await firebase
      .database()
      .ref('ENV_VARS')
      .child('GOOGLE_WEB_ID')
      .once('value');
    GoogleSignin.configure({
      iosClientId: iosClientId.val(),
      webClientId: webClientId.val(),
    }).then(() => {
      GoogleSignin.hasPlayServices({ autoResolve: true })
        .then(() => {
          GoogleSignin.signIn()
            .then(user => {
              console.log(user);
              let first_name = user.givenName;
              let last_name = user.familyName;

              const credential = firebase.auth.GoogleAuthProvider.credential(user.idToken, user.accessToken);

              firebase
                .auth()
                .signInAndRetrieveDataWithCredential(credential)
                .then(result => {
                  let user = result.user;
                  console.log('user firebase ', user);
                  let userData = { uid: user.uid, email: user.email, token: user.token, last_name, first_name };
                  this.createUser(user.uid, userData, user.token).then(() => {
                    if (result.additionalUserInfo && result.additionalUserInfo.isNewUser && user.photoURL) {
                      const imageRef = firebase
                        .storage()
                        .ref('images/' + user.uid)
                        .child('avatar');
                      RNFetchBlob.fetch('GET', user.photoURL)
                        .then(image => image.blob())
                        .then(blob => {
                          imageRef.putFile(blob._ref).then(() => {
                            this.checkForVerification(user);
                          });
                        })
                        .catch(e => {
                          console.log(e);
                          this.checkForVerification(user);
                        });
                    } else {
                      this.checkForVerification(user);
                    }
                  });
                });
            })
            .catch(e => {
              console.log(e);
              this.setState({ googleLoading: false });
              if (e.code != 12501 && e.code != -5) {
                Alert.alert('Error', 'Code: ' + e.code);
              }
            })
            .done();
        })
        .catch(err => {
          console.log('Play services error', err.code, err.message);
          Alert.alert('Play services error', err.code, err.message);
          this.setState({ googleLoading: false });
        });
    });
  }

  checkForVerification(user) {
    if (!user.emailVerified) {
      user
        .sendEmailVerification()
        .then(() => {
          Alert.alert(
            'Account created',
            'You must now verify your email using the link we sent you before you can login'
          );
        })
        .catch(error => {
          Alert.alert('Error', error.message);
        });
    } else {
      this.props.onLogin();
    }
    this.setState({ waitForData: false });
  }
}

const mapStateToProps = ({ profile, nav, sharedInfo }) => ({
  loggedIn: profile.loggedIn,
  nav,
});

const mapDispatchToProps = dispatch => ({
  onLogoutPress: () => {
    dispatch(navigateLogin());
  },
  onLogin: async () => {
    const profile = await dispatch(fetchProfile());
    dispatch(doSetup(profile));
  },
  logout: () => {
    dispatch(navigateLogin());
    dispatch(setLoggedOut());
  },
  goHome: () => dispatch(navigateHome()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
