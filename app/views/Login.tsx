import React, {FunctionComponent, useState, useEffect, useContext} from 'react';
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
import {SetProfile, doSetup, fetchProfile} from '../actions/profile';
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
import database from '@react-native-firebase/database';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';
import {getProfileImage} from '../helpers/images';
import {setupNotifications} from '../helpers/notifications';
import LoginProps from '../types/views/Login';
import styles from '../styles/loginStyles';
import {Layout, Icon, Button, Input, Text, Toggle} from '@ui-kitten/components';
import globalStyles from '../styles/globalStyles';
import {GOOGLE_WEB_ID} from 'react-native-dotenv';
import {ThemeContext} from '../context/themeContext';
import Logo from '../components/Logo/Logo';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_ID, // From Firebase Console Settings
});

const Login: FunctionComponent<LoginProps> = ({
  navigation,
  setProfile,
  hasViewedWelcome,
  setup,
  getProfile,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');

  const {theme, toggleTheme} = useContext(ThemeContext);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      SplashScreen.hide();
      if (
        user &&
        ((user && user.emailVerified) ||
          (user.providerData && user.providerData.length > 0))
      ) {
        debugger;
        const userRef = db().collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          // setProfile(doc.data());
        } else {
          const avatar = getProfileImage(user);
          userRef.set({uid: user.uid, email: user.email, avatar});
          // setProfile({uid: user.uid, email: user.email});
        }

        await getProfile();
        await setup();

        if (hasViewedWelcome) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Tabs'}],
            }),
          );
        } else {
          navigation.navigate('Welcome', {goBack: false});
        }
        setupNotifications(user.uid);
      }
    });
    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, [setProfile, navigation, hasViewedWelcome, setup, getProfile]);

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
      await database()
        .ref('users')
        .child(credentials.user.uid)
        .update({token: data.accessToken});
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
    <Layout style={{flex: 1, justifyContent: 'center', padding: 20}} level="4">
      {spinner && (
        <View style={globalStyles.indicator}>
          <ActivityIndicator />
        </View>
      )}
      <Toggle
        checked={theme === 'dark'}
        onChange={toggleTheme}
        style={{position: 'absolute', top: 40, right: 20}}
      />
      <View style={{alignItems: 'center', margin: 30}}>
        <Logo size={100} />
      </View>
      <Input
        placeholder="Email"
        onChangeText={(u) => setUsername(u)}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessoryLeft={(props) => <Icon {...props} name="email-outline" />}
      />
      <Input
        placeholder="Password"
        secureTextEntry={secure}
        onChangeText={(p) => setPass(p)}
        autoCorrect={false}
        autoCapitalize="none"
        accessoryLeft={(props) => <Icon {...props} name="unlock" />}
        accessoryRight={(props) => (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon {...props} name={secure ? 'eye' : 'eye-off'} />
          </TouchableOpacity>
        )}
      />
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 10,
          marginBottom: 30,
          justifyContent: 'space-evenly',
        }}>
        <Button
          onPress={async () => {
            if (username && pass) {
              setSpinner(true);
              setSecure(true);
              const credentials = await signIn(username, pass);
              if (credentials) {
                if (!credentials.user.emailVerified) {
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
            }
          }}>
          Sign in
        </Button>
        <Button onPress={() => navigation.navigate('SignUp')}>Sign Up</Button>
      </View>
      <View style={{alignItems: 'center'}}>
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
            fill="#fff"
            style={{marginRight: 10, width: 25, height: 25}}
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
            fill="#fff"
            style={{marginLeft: -15, width: 20, height: 20, marginRight: 10}}
            name="google"
          />
          <Text style={styles.spinnerButtonText}>Sign in with Google</Text>
        </SpinnerButton>
      </View>
      <Text
        style={{
          alignSelf: 'center',
        }}>{`v${VersionNumber.appVersion} (${VersionNumber.buildVersion})`}</Text>
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
  getProfile: () => dispatch(fetchProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
