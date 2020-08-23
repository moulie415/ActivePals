import React, {FunctionComponent, useState, useEffect} from 'react';
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import VersionNumber from 'react-native-version-number';
import SpinnerButton from 'react-native-spinner-button';
import auth from '@react-native-firebase/auth';
import {connect} from 'react-redux';
import {SetProfile, doSetup} from '../actions/profile';
import Profile from '../types/Profile';
import {MyThunkDispatch, MyRootState} from '../types/Shared';
import {CommonActions} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import db from '@react-native-firebase/firestore';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';
import {getProfileImage} from '../helpers/images';
import {setupNotifications} from '../helpers/notifications';
import LoginProps from '../types/views/Login';
import styles from '../styles/loginStyles';
import {Layout, Icon, Button, Input, Text} from '@ui-kitten/components';
import globalStyles from '../styles/globalStyles';

GoogleSignin.configure({
  webClientId:
    '48631950986-ibg0u91q5m6hsllkunhe9frf00id7r8c.apps.googleusercontent.com', // From Firebase Console Settings
});

const Login: FunctionComponent<LoginProps> = ({
  navigation,
  setProfile,
  hasViewedWelcome,
  setup,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      SplashScreen.hide();
      if (
        user &&
        ((user && user.emailVerified) ||
          (user.providerData && user.providerData.length > 0))
      ) {
        const userRef = db().collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          setProfile(doc.data());
        } else {
          const avatar = getProfileImage(user);
          userRef.set({uid: user.uid, email: user.email, avatar});
          setProfile({uid: user.uid, email: user.email});
        }
        setup();
        if (hasViewedWelcome) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Tabs'}],
            }),
          );
        } else {
          navigation.navigate('Welcome');
        }
        setupNotifications(user.uid);
      }
    });
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, [setProfile, navigation, hasViewedWelcome, setup]);

  const signIn = async (email: string, password: string) => {
    try {
      return await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const appleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw 'Apple Sign-In failed - no identify token returned';
      }

      // Create a Firebase credential from the response
      const {identityToken, nonce} = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Sign the user in with the credential
      return await auth().signInWithCredential(appleCredential);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const facebookSignIn = async () => {
    try {
      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }

      // Once signed in, get the users AccesToken
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw 'Something went wrong obtaining access token';
      }
      // Create a Firebase credential with the AccessToken
      const facebookCredential = auth.FacebookAuthProvider.credential(
        data.accessToken,
      );
      // Sign-in the user with the credential
      const credentials = await auth().signInWithCredential(facebookCredential);
      setFacebookLoading(false);
      return credentials;
    } catch (e) {
      Alert.alert('Error', e.message);
      setFacebookLoading(false);
    }
  };

  const googleSignIn = async () => {
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const credentials = await auth().signInWithCredential(googleCredential);
    setGoogleLoading(false);
    return credentials;
  };

  return (
    <Layout>
      {spinner && (
        <View style={globalStyles.indicator}>
          <ActivityIndicator />
        </View>
      )}

      <View>
        <Icon size={25} name="envelope" solid />
        <Input
          placeholder="Email"
          onChangeText={(u) => setUsername(u)}
          placeholderTextColor="#fff"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
      </View>
      <View>
        <Icon size={25} name="unlock" solid />
        <Input
          placeholder="Password"
          secureTextEntry={secure}
          placeholderTextColor="#fff"
          onChangeText={(p) => setPass(p)}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Icon size={30} name={secure ? 'eye' : 'eye-slash'} solid />
        </TouchableOpacity>
      </View>
      <View
        style={{flexDirection: 'row', marginVertical: 10, marginBottom: 30}}>
        <Button
          onPress={async () => {
            if (username && pass) {
              setSpinner(true);
              setSecure(true);
              const {user} = await signIn(username, pass);
              if (!user.emailVerified) {
                Alert.alert(
                  'Sorry',
                  'You must first verify your email using the link we sent you before logging in',
                );
              }
            } else {
              Alert.alert(
                'Sorry',
                'Please enter both your email and your password',
              );
            }
          }}>
          Sign in
        </Button>
        <Button onPress={() => navigation.navigate('SignUp')}>Sign Up</Button>
      </View>
      <View>
        {Platform.OS === 'ios' && (
          <AppleButton
            buttonStyle={AppleButton.Style.WHITE}
            buttonType={AppleButton.Type.SIGN_IN}
            style={styles.appleButton}
            onPress={appleSignIn}
          />
        )}
        <SpinnerButton
          onPress={() => {
            setFacebookLoading(true);
            facebookSignIn();
          }}
          isLoading={facebookLoading}
          spinnerType="MaterialIndicator"
          buttonStyle={[{backgroundColor: '#3b5998'}, styles.spinnerButton]}>
          <Icon
            size={20}
            style={{color: '#fff', marginRight: 10}}
            name="facebook"
          />
          <Text style={styles.spinnerButtonText}>Sign in with Facebook</Text>
        </SpinnerButton>
        <SpinnerButton
          isLoading={googleLoading}
          spinnerType="MaterialIndicator"
          onPress={() => {
            setGoogleLoading(true);
            googleSignIn();
          }}
          buttonStyle={[{backgroundColor: '#ea4335'}, styles.spinnerButton]}>
          <Icon
            size={20}
            style={{marginLeft: -15, color: '#fff', marginRight: 10}}
            name="google"
          />
          <Text style={styles.spinnerButtonText}>Sign in with Google</Text>
        </SpinnerButton>
      </View>
      <Text>{`v${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}</Text>
    </Layout>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  loggedIn: profile.loggedIn,
  hasViewedWelcome: profile.hasViewedWelcome,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  setProfile: (profile: Profile) => dispatch(SetProfile(profile)),
  setup: () => dispatch(doSetup()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
