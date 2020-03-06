import React, { Component } from 'react';
import { Alert, View, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import { GoogleSignin } from '@react-native-community/google-signin';
import { StackActions, NavigationActions } from 'react-navigation';
import VersionNumber from 'react-native-version-number';
import SplashScreen from 'react-native-splash-screen';
import RNFetchBlob from 'rn-fetch-blob';
import SpinnerButton from 'react-native-spinner-button';
import { PulseIndicator } from 'react-native-indicators';
import { connect } from 'react-redux';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import { GOOGLE_IOS_ID, GOOGLE_WEB_ID } from 'react-native-dotenv';
import Button from '../components/Button';
import { AccountType } from '../types/Profile';
import styles from '../styles/loginStyles';
import sStyles from '../styles/settingsStyles';
import colors from '../constants/colors';
import Text from '../components/Text';
import str from '../constants/strings';
import { doSetup, fetchProfile, setLoggedOut } from '../actions/profile';
import LoginProps from '../types/views/Login';

interface State {
  spinner: boolean;
  secure: boolean;
  waitForData?: boolean;
  facebookLoading?: boolean;
  googleLoading?: boolean;
  username?: string;
  pass?: string;
  navigating: boolean;
}

class Login extends Component<LoginProps, State> {
  secondAuthChange: boolean;

  constructor(props) {
    super(props);
    this.secondAuthChange = false;
    this.state = {
      spinner: false,
      secure: true,
      navigating: false,
    };
  }

  componentDidMount() {
    const { onLogin, loggedIn, navigation, loggedOut } = this.props;
    const { waitForData } = this.state;
    firebase.auth().onAuthStateChanged(async user => {
      if (user && (user.emailVerified || (user.providerData && user.providerData.length > 0)) && !waitForData) {
        /* ios onAuthStateChanged gets called twice so we want to account
        for this so that we don't have unnecessary calls */
        if (this.secondAuthChange) {
          loggedIn ? await onLogin() : onLogin();
          this.goNext();
        } else {
          this.secondAuthChange = true;
        }
      } else if (loggedIn) {
        navigation.navigate('Login');
        loggedOut();
        SplashScreen.hide();
        this.setState({ googleLoading: false, facebookLoading: false });
      } else {
        SplashScreen.hide();
        this.setState({ googleLoading: false, facebookLoading: false });
      }
    });
  }

  createUser = async (uid, userData, token) => {
    const snapshot = await firebase
      .database()
      .ref('admins')
      .child(uid)
      .once('value');
    const defaults = {
      uid,
      token,
      accountType: snapshot.val() ? AccountType.ADMIN : AccountType.STANDARD,
    };
    await firebase
      .database()
      .ref('users')
      .child(uid)
      .update({ ...userData, ...defaults });
  };

  authenticate = token => {
    const provider = firebase.auth.FacebookAuthProvider;
    const credential = provider.credential(token);
    return firebase.auth().signInWithCredential(credential);
  };

  goNext() {
    const { hasViewedWelcome, navigation } = this.props;
    const { navigating } = this.state;
    if (!navigating) {
      this.setState({ navigating: true }, () => {
        if (hasViewedWelcome) {
          navigation.dispatch(
            StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'MainNav' })],
            })
          );
        } else {
          navigation.navigate('Welcome');
        }
        SplashScreen.hide();
        this.setState({ spinner: false });
      });
    }
  }

  async handleCallBack(callback) {
    const { onLogin } = this.props;
    if (callback.isCancelled) {
      this.setState({ facebookLoading: false });
    } else {
      try {
        const data = await AccessToken.getCurrentAccessToken();
        const token = data.accessToken;
        const response = await fetch(
          `https://graph.facebook.com/v5.0/me?fields=id,email,first_name,last_name,gender,birthday&access_token=${token}`
        );
        const json = await response.json();
        json.fb_login = true;
        const imageSize = 200;
        const facebookID = json.id;
        const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`;
        const result = await this.authenticate(data.accessToken);
        const { uid } = result.user;
        firebase
          .database()
          .ref('fbusers')
          .child(facebookID)
          .set(uid);
        if (!result.additionalUserInfo.isNewUser) {
          await onLogin();
          this.goNext();
        } else {
          try {
            const imageRef = firebase
              .storage()
              .ref(`images/${uid}`)
              .child('avatar');
            const image = await RNFetchBlob.fetch('GET', fbImage);
            // @ts-ignore
            const blob = await image.blob();
            await imageRef.putFile(blob._ref);
          } catch (e) {
            console.warn('Error setting user image', e.message);
          }
          await this.createUser(uid, json, token);
          await onLogin();
          this.goNext();
          this.setState({ facebookLoading: false });
        }
      } catch (e) {
        Alert.alert('Error', e.message);
        this.setState({ facebookLoading: false });
      }
    }
  }

  fbLogin() {
    this.setState({ facebookLoading: true });
    LoginManager.logInWithPermissions(['public_profile', 'email', 'user_friends']).then(
      result => this.handleCallBack(result),
      error => {
        Alert.alert('Error', `Login fail with error: ${error}`);
      }
    );
  }

  async login(email, pass) {
    const { onLogin } = this.props;
    try {
      const { user } = await firebase.auth().signInWithEmailAndPassword(email, pass);
      if (user.emailVerified) {
        await onLogin();
        this.goNext();
      } else {
        this.setState({ spinner: false });
        Alert.alert('Sorry', 'You must first verify your email using the link we sent you before logging in');
      }

      // Navigate to the Home page
    } catch (error) {
      this.setState({ spinner: false });
      Alert.alert(error.toString());
    }
  }

  async gLogin() {
    this.setState({ waitForData: true });
    try {
      await GoogleSignin.configure({
        iosClientId: GOOGLE_IOS_ID,
        webClientId: GOOGLE_WEB_ID,
      });
      await GoogleSignin.hasPlayServices();
      const { user: gUser, idToken, serverAuthCode } = await GoogleSignin.signIn();
      const first_name = gUser.givenName;
      const last_name = gUser.familyName;
      const credential = firebase.auth.GoogleAuthProvider.credential(idToken, serverAuthCode);
      const result = await firebase.auth().signInAndRetrieveDataWithCredential(credential);
      const { user } = result;
      console.log('user firebase ', user);
      const userData = { uid: user.uid, email: user.email, token: credential.token, last_name, first_name };
      await this.createUser(user.uid, userData, credential.token);
      if (result.additionalUserInfo && result.additionalUserInfo.isNewUser && user.photoURL) {
        try {
          const imageRef = firebase
            .storage()
            .ref(`images/${user.uid}`)
            .child('avatar');
          const image = await RNFetchBlob.fetch('GET', user.photoURL);
          // @ts-ignore
          const blob = await image.blob();
          await imageRef.putFile(blob._ref);
        } catch (e) {
          console.warn('Error setting user image', e.message);
        }
        this.checkForVerification(user);
      } else {
        this.checkForVerification(user);
      }
    } catch (e) {
      this.setState({ googleLoading: false });
      if (e.code !== 12501 && e.code !== -5) {
        Alert.alert('Error', `Code: ${e.code}, Message: ${e.message}`);
      }
    }
  }

  async checkForVerification(user) {
    const { onLogin } = this.props;
    if (!user.emailVerified) {
      await user.sendEmailVerification();
      Alert.alert('Account created', 'You must now verify your email using the link we sent you before you can login');
    } else {
      await onLogin();
      this.goNext();
    }
    this.setState({ waitForData: false });
  }

  render() {
    const { navigation } = this.props;
    const { spinner, secure, facebookLoading, googleLoading, username, pass } = this.state;
    return (
      <ImageBackground style={styles.container} source={require('../../assets/images/Running-background.jpg')}>
        {spinner && (
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
            onChangeText={u => this.setState({ username: u })}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputGrp}>
          <Icon size={25} name="md-unlock" style={styles.icon} />
          <TextInput
            placeholder="Password"
            secureTextEntry={secure}
            placeholderTextColor="#fff"
            onChangeText={p => this.setState({ pass: p })}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => this.setState({ secure: !secure })}>
            <Icon size={30} name={secure ? 'ios-eye' : 'ios-eye-off'} style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', marginVertical: 10 }}>
          <Button
            text="Login"
            onPress={() => {
              if (username && pass) {
                this.setState({ spinner: true, secure: true });
                this.login(username, pass);
              } else {
                Alert.alert('Sorry', 'Please enter both your email and your password');
              }
            }}
            style={[{ marginRight: 10 }, styles.button]}
          />
          <Button style={styles.button} onPress={() => navigation.navigate('SignUp')} text="Sign Up" />
        </View>
        <View>
          <SpinnerButton
            onPress={() => this.fbLogin()}
            isLoading={facebookLoading}
            spinnerType={str.spinner}
            buttonStyle={[{ backgroundColor: '#3b5998' }, styles.spinnerButton]}
          >
            <Icon size={25} style={{ color: '#fff', marginRight: 10 }} name="logo-facebook" />
            <Text style={{ color: '#fff' }}>Login with Facebook</Text>
          </SpinnerButton>
          <SpinnerButton
            isLoading={googleLoading}
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
          {`v${VersionNumber.appVersion}`}
        </Text>
      </ImageBackground>
    );
  }
}

const mapStateToProps = ({ profile }) => ({
  loggedIn: profile.loggedIn,
  hasViewedWelcome: profile.hasViewedWelcome,
});

const mapDispatchToProps = dispatch => ({
  onLogin: async () => {
    const profile = await dispatch(fetchProfile());
    await dispatch(doSetup(profile));
  },
  loggedOut: () => dispatch(setLoggedOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
