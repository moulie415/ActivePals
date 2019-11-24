import React, { Component } from 'react';
import { Alert, View, ScrollView, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import Image from 'react-native-fast-image';
import Text, { globalTextStyle } from '../components/Text';
import styles from '../styles/profileStyles';
import hStyles from '../styles/homeStyles';
import colors from '../constants/colors';
import TouchableOpacity from '../components/TouchableOpacityLockable';
import DatePicker from 'react-native-datepicker';
var ImagePicker = require('react-native-image-picker');
import ImageResizer from 'react-native-image-resizer';
import RNPickerSelect from 'react-native-picker-select';
import Header from '../components/Header/header';
import { PulseIndicator } from 'react-native-indicators';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';

class Profile extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => <Icon name="md-person" size={25} style={{ color: tintColor }} />,
  };

  constructor(props) {
    super(props);
    this.profile = this.props.profile;

    firebase
      .storage()
      .ref('images/' + this.profile.uid)
      .child('backdrop')
      .getDownloadURL()
      .then(backdrop => this.setState({ backdrop, initialBackdrop: backdrop }))
      .catch(e => console.log(e));

    this.user = null;
    this.state = {
      email: this.profile.email,
      profile: this.profile,
      initialProfile: this.profile,
      spinner: false,
      initialAvatar: this.profile.avatar,
      avatar: this.profile.avatar,
    };
  }

  componentDidMount() {
    this.listenForUserChanges(firebase.database().ref('users/' + this.profile.uid));
  }

  listenForUserChanges(ref) {
    ref.on('value', snapshot => {
      let profile = snapshot.val();
      this.setState({ initialProfile: profile });
      this.setState({ profile });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.profile) {
      let profile = nextProps.profile;
      this.setState({ profile, initialProfile: profile, initialAvatar: profile.avatar });
    }
  }

  render() {
    const { gym } = this.props;
    return (
      <>
        <Header
          left={
            this.hasChanged() && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 8, bottom: 0, left: 0, justifyContent: 'center', paddingLeft: 10 }}
                onPress={() => {
                  this.setState({
                    profile: this.state.initialProfile,
                    avatar: this.state.initialAvatar,
                    backdrop: this.state.initialBackdrop,
                  });
                }}
              >
                <Text style={{ color: '#fff' }}>UNDO</Text>
              </TouchableOpacity>
            )
          }
          title={'Profile'}
          right={
            this.hasChanged() && (
              <TouchableOpacity
                onPress={mutex => {
                  mutex.lockFor(1000);
                  this.updateUser(this.state.initialProfile, this.state.profile);
                }}
                style={{ backgroundColor: 'transparent', elevation: 0 }}
              >
                <Text style={{ color: '#fff' }}>SAVE</Text>
              </TouchableOpacity>
            )
          }
        />
        <ScrollView>
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity style={{ width: '100%' }} onPress={() => this.selectAvatar(true)}>
              {this.state.backdrop ? (
                <Image style={{ height: 150 }} resizeMode="cover" source={{ uri: this.state.backdrop }} />
              ) : (
                <View style={{ height: 150, backgroundColor: colors.primaryLighter, justifyContent: 'center' }}>
                  <Icon name="ios-add" size={25} style={{ color: '#fff', textAlign: 'center' }} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[{ marginTop: -45 }, globalStyles.shadow]} onPress={() => this.selectAvatar()}>
              {this.state.avatar ? (
                <Image
                  source={{ uri: this.state.avatar }}
                  style={{ width: 90, height: 90, alignSelf: 'center', borderWidth: 0.5, borderColor: '#fff' }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    alignSelf: 'center',
                    backgroundColor: colors.secondary,
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="ios-add" size={25} style={{ color: '#fff', textAlign: 'center' }} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginRight: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '60%' }}>
              <Text style={{ color: '#999', marginHorizontal: 20 }}>
                Email: <Text style={{ color: colors.secondary }}>{this.state.email}</Text>
              </Text>
              <Text style={{ color: '#999', marginHorizontal: 20, marginBottom: gym ? 0 : 10 }}>
                Account type:{' '}
                <Text style={{ color: colors.secondary }}>{this.state.profile && this.state.profile.accountType}</Text>
              </Text>
              {gym && (
                <TouchableOpacity onPress={() => this.props.goToGym(gym.place_id)}>
                  <Text style={{ color: '#999', marginHorizontal: 20, marginBottom: 10 }}>
                    {'Gym: '}
                    <Text style={{ color: colors.secondary }}>{gym.name}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flex: 1, marginRight: 20 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}
                onPress={() => this.props.goToSettings()}
              >
                <Text style={{ color: colors.secondary, marginRight: 10 }}>Settings</Text>
                <Icon size={25} name="md-settings" style={{ color: colors.secondary }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Username: </Text>
            <TextInput
              value={this.state.profile && this.state.profile.username}
              onChangeText={username => this.setState({ profile: { ...this.state.profile, username } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>First name: </Text>
            <TextInput
              value={this.state.profile && this.state.profile.first_name}
              onChangeText={name => this.setState({ profile: { ...this.state.profile, first_name: name } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Last name: </Text>
            <TextInput
              value={this.state.profile && this.state.profile.last_name}
              onChangeText={name => this.setState({ profile: { ...this.state.profile, last_name: name } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize={'none'}
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Preferred activity: </Text>
            <RNPickerSelect
              placeholder={{
                label: 'Unspecified',
                value: null,
              }}
              hideIcon={true}
              items={pickerItems(activities)}
              style={{
                underline: { opacity: 0 },
                viewContainer: {
                  flex: 1,
                  justifyContent: 'center',
                  paddingHorizontal: 5,
                },
                placeholderColor: '#fff',
                inputAndroid: {
                  color: '#fff',
                },
                inputIOS: {
                  color: '#fff',
                },
              }}
              onValueChange={value => {
                this.setState({
                  profile: { ...this.state.profile, activity: value },
                });
              }}
              //style={{ ...pickerSelectStyles }}
              value={this.state.profile ? this.state.profile.activity : null}
            />
          </View>
          {this.state.profile && this.state.profile.activity && (
            <View style={styles.inputGrp}>
              <Text style={{ alignSelf: 'center' }}>Level: </Text>
              <RNPickerSelect
                placeholder={{
                  label: 'Unspecified',
                  value: null,
                }}
                hideIcon={true}
                items={pickerItems(levels)}
                style={{
                  underline: { opacity: 0 },
                  viewContainer: {
                    flex: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 5,
                  },
                  placeholderColor: '#fff',
                  inputAndroid: {
                    color: '#fff',
                  },
                  inputIOS: {
                    color: '#fff',
                  },
                }}
                onValueChange={value => {
                  this.setState({
                    profile: { ...this.state.profile, level: value },
                  });
                }}
                //style={{ ...pickerSelectStyles }}
                value={this.state.profile.level}
              />
            </View>
          )}
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Birthday: </Text>
            <DatePicker
              date={this.getDate(this.state.profile && this.state.profile.birthday)}
              placeholder={(this.state.profile && this.state.profile.birthday) || 'None'}
              maxDate={new Date()}
              confirmBtnText={'Confirm'}
              androidMode={'spinner'}
              cancelBtnText={'Cancel'}
              customStyles={{
                dateText: {
                  color: '#fff',
                  fontFamily: 'Montserrat',
                },
                placeholderText: {
                  color: '#fff',
                  fontFamily: 'Montserrat',
                },
                dateInput: {
                  borderWidth: 0,
                },
              }}
              onDateChange={date => this.setState({ profile: { ...this.state.profile, birthday: date } })}
            />
          </View>

          <Button style={styles.logout} text="Log out" onPress={() => this.logout()} />
          {this.state.spinner && (
            <View style={hStyles.spinner}>
              <PulseIndicator color={colors.secondary} />
            </View>
          )}
        </ScrollView>
      </>
    );
  }

  getDate(date) {
    if (date) {
      let formatted = date.replace(/-/g, '/');
      return new Date(formatted);
    } else return null;
  }

  async updateUser(initial, profile) {
    if (!this.hasChanged()) {
      Alert.alert('No changes');
    } else {
      if (!profile.username || profile.username.length < 5 || str.whiteSpaceRegex.test(profile.username)) {
        Alert.alert('Sorry', 'Username must be at least 5 characters long and cannot contain any spaces');
      } else {
        this.setState({ spinner: true });
        await this.checkImages();
        delete profile.avatar;
        firebase
          .database()
          .ref('users/' + this.profile.uid)
          .set({ ...profile })
          .then(() => {
            initial.username &&
              firebase
                .database()
                .ref('usernames')
                .child(initial.username)
                .remove();
            firebase
              .database()
              .ref('usernames')
              .child(profile.username)
              .set(profile.uid)
              .then(() => {
                Alert.alert('Success', 'Profile saved');
                /*we need to make sure the username is saved locally 
          which is why this calls fetchProfile which saves the username*/
                this.props.onSave();
                this.setState({ spinner: false });
              });
          })
          .catch(e => {
            Alert.alert('Error', 'That username may have already been taken');
            this.setState({ spinner: false });
          });
      }
    }
  }

  hasChanged() {
    return !(
      JSON.stringify(this.state.initialProfile) === JSON.stringify(this.state.profile) &&
      this.state.initialAvatar == this.state.avatar &&
      this.state.backdrop == this.state.initialBackdrop
    );
  }

  async checkImages() {
    try {
      if (this.state.initialAvatar != this.state.avatar) {
        const url = await this.uploadImage(this.state.avatar);
        this.setState({ initialAvatar: url, avatar: url });
      }
      if (this.state.initialBackdrop != this.state.backdrop) {
        const url = await this.uploadImage(this.state.backdrop, true);
        this.setState({ initialBackdrop: url, backdrop: url });
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  selectAvatar(backdrop = false) {
    var options = {
      title: backdrop ? 'Select Backdrop' : 'Select Avatar',
      mediaType: 'photo',
      noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    this.setState({ spinner: true });
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({ spinner: false });
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        this.setState({ spinner: false });
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        this.setState({ spinner: false });
      } else {
        let source = { uri: response.uri };

        const size = 640;
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100)
          .then(resized => {
            // response.uri is the URI of the new image that can now be displayed, uploaded...
            // response.path is the path of the new image
            // response.name is the name of the new image with the extension
            // response.size is the size of the new image
            this.setState(backdrop ? { backdrop: resized.uri } : { avatar: resized.uri });
            this.setState({ spinner: false });
          })
          .catch(e => {
            Alert.alert('Error', e.message);
          });
      }
    });
  }

  uploadImage(uri, backdrop = false, mime = 'application/octet-stream') {
    return new Promise((resolve, reject) => {
      const imageRef = firebase
        .storage()
        .ref('images/' + this.profile.uid)
        .child(backdrop ? 'backdrop' : 'avatar');
      return imageRef
        .putFile(uri, { contentType: mime })
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then(url => {
          resolve(url);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  logout() {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', onPress: () => console.log('Cancel logout'), style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            this.setState({ spinner: true });
            await firebase
              .database()
              .ref('users/' + this.props.profile.uid)
              .child('state')
              .remove();
            await firebase.messaging().deleteToken();
            await firebase.auth().signOut();
            this.setState({ spinner: false });
            this.props.onLogoutPress();
          } catch (e) {
            Alert('Error', e.message);
            this.props.onLogoutPress();
          }
        },
      },
    ]);
  }
}

const pickerItems = array => {
  let items = [];
  array.forEach(item => {
    items.push({ label: item, value: item });
  });
  return items;
};

const activities = ['Bodybuilding', 'Powerlifting', 'Swimming', 'Cycling', 'Running', 'Sprinting'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

import { connect } from 'react-redux';
import { navigateLogin, navigateSettings } from '../actions/navigation';
import { fetchProfile, setLoggedOut } from '../actions/profile';
import { navigateGym } from '../actions/navigation';
import signUpStyles from '../styles/signUpStyles';
import str from '../constants/strings';

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile,
  gym: profile.gym,
});

const mapDispatchToProps = dispatch => ({
  onLogoutPress: () => {
    dispatch(setLoggedOut());
    dispatch(navigateLogin());
  },
  onSave: () => dispatch(fetchProfile()),
  goToSettings: () => dispatch(navigateSettings()),
  goToGym: gym => dispatch(navigateGym(gym)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
