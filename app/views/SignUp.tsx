import React, {FunctionComponent, useState} from 'react';
import {
  Alert,
  View,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {AccountType} from '../types/Profile';
import str from '../constants/strings';
import SignUpProps from '../types/views/SignUp';
import {Layout, Button, Input, Icon} from '@ui-kitten/components';
import globalStyles from '../styles/globalStyles';
import styles from '../styles/signUpStyles';

const SignUp: FunctionComponent<SignUpProps> = ({navigation}) => {
  const [spinner, setSpinner] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const createUser = (uid: string, userData: any, token: string) => {
    database()
      .ref('admins')
      .child(uid)
      .once('value', (snapshot) => {
        const defaults = {
          uid,
          token,
          accountType: snapshot.val()
            ? AccountType.ADMIN
            : AccountType.STANDARD,
        };
        database()
          .ref('users')
          .child(uid)
          .update({...userData, ...defaults});
        if (username) {
          database().ref('usernames').child(username).set(uid);
        }
      });
  };

  const signup = async () => {
    try {
      const {user} = await auth().createUserWithEmailAndPassword(email, pass);
      const userData = {uid: user.uid, email: user.email, username};
      createUser(user.uid, userData, '');
      await user.sendEmailVerification();
      navigation.goBack();
      Alert.alert(
        'Account created',
        'You must now verify your email using the link we sent you before you can login',
      );
      setSpinner(false);
    } catch (error) {
      console.log(error.toString());
      setSpinner(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Layout style={{flex: 1, justifyContent: 'center', padding: 20}} level="4">
      {spinner && (
        <View style={globalStyles.indicator}>
          <ActivityIndicator />
        </View>
      )}

      <Input
        style={styles.input}
        placeholder="Username"
        onChangeText={(u) => setUsername(u)}
        value={username}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessoryLeft={(props) => <Icon {...props} name="person" />}
      />
      <Input
        style={styles.input}
        placeholder="Email"
        onChangeText={(e) => setEmail(e)}
        value={email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        accessoryLeft={(props) => <Icon {...props} name="email-outline" />}
      />
      <Input
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(p) => setPass(p)}
        value={pass}
        accessoryLeft={(props) => <Icon {...props} name="unlock" />}
      />
      <Input
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        onChangeText={(p) => setConfirm(p)}
        value={confirm}
        accessoryLeft={(props) => <Icon {...props} name="unlock" />}
      />
      <Button
        style={{paddingHorizontal: 20, alignSelf: 'center'}}
        onPress={async () => {
          if (pass === confirm) {
            setSpinner(true);
            if (
              username &&
              username.length > 5 &&
              !str.whiteSpaceRegex.test(username)
            ) {
              const snapshot = await database()
                .ref(`/usernames/${username}`)
                .once('value');
              if (snapshot.val()) {
                Alert.alert('Sorry', 'That username is already in use');
                setSpinner(false);
              } else {
                signup();
              }
            } else {
              Alert.alert(
                'Sorry',
                'Username must be at least 5 characters long and cannot contain any spaces',
              );
              setSpinner(false);
            }
          } else {
            Alert.alert('Please try again', 'Passwords do not match');
            setSpinner(false);
          }
        }}>
        Sign up
      </Button>
    </Layout>
  );
};

export default connect()(SignUp);
