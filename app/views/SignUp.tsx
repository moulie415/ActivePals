import React, { Component } from 'react';
import { Alert, View, ImageBackground, KeyboardAvoidingView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { PulseIndicator } from 'react-native-indicators';
import firebase from 'react-native-firebase';
import { connect } from 'react-redux';
import styles from '../styles/signUpStyles';
import colors from '../constants/colors';
import Header from '../components/Header/header';
import sStyles from '../styles/settingsStyles';
import Button from '../components/Button';
import { navigateBack } from '../actions/navigation';
import { AccountType } from '../types/Profile';
import str from '../constants/strings';
import SignUpProps from '../types/views/SignUp';

const background = require('../../assets/images/Running-background.jpg');

interface State {
  spinner: boolean;
  username?: string;
  email?: string;
  pass?: string;
  confirm?: string;
}
class SignUp extends Component<SignUpProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
    };
  }

  createUser = (uid, userData, token) => {
    const { username } = this.state;
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
        //Alert.alert("Success", "Logged in as: " + userData.email)
        firebase
          .database()
          .ref('users')
          .child(uid)
          .update({ ...userData, ...defaults });
        if (username) {
          firebase
            .database()
            .ref('usernames')
            .child(username)
            .set(uid);
        }
      });
  };

  static navigationOptions = {
    header: null,
  };

  async signup(email, pass) {
    const { username } = this.state;
    const { goBack } = this.props;
    try {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass)
        .then(({ user }) => {
          const userData = { uid: user.uid, email: user.email, username };
          this.createUser(user.uid, userData, '');
          user
            .sendEmailVerification()
            .then(() => {
              goBack();
              Alert.alert(
                'Account created',
                'You must now verify your email using the link we sent you before you can login'
              );
              this.setState({ spinner: false });
            })
            .catch(error => {
              Alert.alert('Error', error.message);
              this.setState({ spinner: false });
            });
        })
        .catch(error => {
          console.log(error);
          Alert.alert('Error', error.message);
          this.setState({ spinner: false });
        });
    } catch (error) {
      console.log(error.toString());
      this.setState({ spinner: false });
      Alert.alert(error.toString());
    }
  }

  render() {
    const { username, email, pass, confirm, spinner } = this.state;
    return (
      <ImageBackground style={styles.container} source={background}>
        <Header hasBack title="Sign up" />
        {spinner && (
          <View style={sStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <KeyboardAvoidingView behavior="padding" style={{ justifyContent: 'center', flex: 1 }}>
          <View style={styles.inputGrp}>
            <Icon size={25} name="ios-person" style={{ color: '#fff', marginRight: 5 }} />
            <TextInput
              placeholder="Username"
              onChangeText={u => this.setState({ username: u })}
              value={username}
              placeholderTextColor="#FFF"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputGrp}>
            <Icon size={25} name="md-mail" style={styles.icon} />
            <TextInput
              placeholder="Email"
              onChangeText={e => this.setState({ email: e })}
              value={email}
              placeholderTextColor="#FFF"
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
              secureTextEntry
              placeholderTextColor="#FFF"
              onChangeText={p => this.setState({ pass: p })}
              value={pass}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGrp}>
            <Icon size={25} name="md-unlock" style={styles.icon} />
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor="#FFF"
              onChangeText={p => this.setState({ confirm: p })}
              value={confirm}
              style={styles.input}
            />
          </View>
          <Button
            style={{ paddingHorizontal: 20, alignSelf: 'center' }}
            onPress={async () => {
              if (pass === confirm) {
                this.setState({ spinner: true });
                if (username && username.length > 5 && !str.whiteSpaceRegex.test(username)) {
                  const snapshot = await firebase
                    .database()
                    .ref(`/usernames/${username}`)
                    .once('value');
                  if (snapshot.val()) {
                    Alert.alert('Sorry', 'That username is already in use');
                    this.setState({ spinner: false });
                  } else {
                    this.signup(email, pass);
                  }
                } else {
                  Alert.alert('Sorry', 'Username must be at least 5 characters long and cannot contain any spaces');
                  this.setState({ spinner: false });
                }
              } else {
                Alert.alert('Please try again', 'Passwords do not match');
                this.setState({ spinner: false });
              }
            }}
            text="Sign up"
          />
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}
// const mapStateToProps = ({ home, settings, profile }) => ({
// })

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
});

export default connect(null, mapDispatchToProps)(SignUp);
