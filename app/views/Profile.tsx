import React, { Component } from 'react';
import { Alert, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNPickerSelect from 'react-native-picker-select';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import { connect } from 'react-redux';
import Text, { globalTextStyle } from '../components/Text';
import styles from '../styles/profileStyles';
import hStyles from '../styles/homeStyles';
import colors from '../constants/colors';
import Header from '../components/Header/header';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { fetchProfile, setLoggedOut } from '../actions/profile';
import { pickerItems } from '../constants/utils';
import str from '../constants/strings';
import ProfileProps from '../types/views/Profile';
import ImagePickerOptions from '../types/Shared';
import Profile from '../types/Profile';

const activities = ['Bodybuilding', 'Powerlifting', 'Swimming', 'Cycling', 'Running', 'Sprinting'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

interface State {
  spinner: boolean;
  email: string;
  profile: Profile;
  initialProfile: Profile;
  initialAvatar: string;
  avatar: string;
  backdrop?: string;
  initialBackdrop?: string;
  showPicker?: boolean;
}
class ProfileView extends Component<ProfileProps, State> {
  constructor(props) {
    super(props);
    const { profile } = this.props;
    this.state = {
      email: profile.email,
      profile,
      initialProfile: profile,
      spinner: false,
      initialAvatar: profile.avatar,
      avatar: profile.avatar,
    };
  }

  async componentDidMount() {
    const { profile } = this.props;
    try {
      const backdrop = await firebase
        .storage()
        .ref(`images/${profile.uid}`)
        .child('backdrop')
        .getDownloadURL();
      this.setState({ backdrop, initialBackdrop: backdrop });
    } catch (e) {
      console.log(e);
    }
    this.listenForUserChanges(firebase.database().ref(`users/${profile.uid}`));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.profile) {
      const { profile } = nextProps;
      this.setState({ profile, initialProfile: profile, initialAvatar: profile.avatar });
    }
  }

  listenForUserChanges(ref) {
    ref.on('value', snapshot => {
      const profile = snapshot.val();
      this.setState({ initialProfile: profile });
      this.setState({ profile });
    });
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => <Icon name="md-person" size={25} style={{ color: tintColor }} />,
  };

  logout() {
    const { profile, onLogoutPress, navigation } = this.props;
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', onPress: () => console.log('Cancel logout'), style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            this.setState({ spinner: true });
            await firebase
              .database()
              .ref(`users/${profile.uid}`)
              .child('state')
              .remove();
            await firebase.messaging().deleteToken();
            await firebase.auth().signOut();
            this.setState({ spinner: false });
            onLogoutPress();
            navigation.navigate('Login');
          } catch (e) {
            Alert.alert('Error', e.message);
            onLogoutPress();
            navigation.navigate('Login');
          }
        },
      },
    ]);
  }

  async selectAvatar(backdrop = false) {
    const options: ImagePickerOptions = {
      title: backdrop ? 'Select Backdrop' : 'Select Avatar',
      mediaType: 'photo',
      noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    this.setState({ spinner: true });
    ImagePicker.showImagePicker(options, async response => {
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
        const source = { uri: response.uri };

        const size = 640;
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        const resized = await ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100);
        // response.uri is the URI of the new image that can now be displayed, uploaded...
        // response.path is the path of the new image
        // response.name is the name of the new image with the extension
        // response.size is the size of the new image
        this.setState(backdrop ? { backdrop: resized.uri } : { avatar: resized.uri });
        this.setState({ spinner: false });
      }
    });
  }

  uploadImage(uri, backdrop = false, mime = 'application/octet-stream'): Promise<string> {
    const { profile } = this.props;
    return new Promise((resolve, reject) => {
      const imageRef = firebase
        .storage()
        .ref(`images/${profile.uid}`)
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

  async checkImages() {
    const { initialAvatar, avatar, backdrop, initialBackdrop } = this.state;
    try {
      if (initialAvatar !== avatar) {
        const url = await this.uploadImage(avatar);
        this.setState({ initialAvatar: url, avatar: url });
      }
      if (initialBackdrop !== backdrop) {
        const url = await this.uploadImage(backdrop, true);
        this.setState({ initialBackdrop: url, backdrop: url });
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  hasChanged() {
    const { initialProfile, initialAvatar, avatar, profile, backdrop, initialBackdrop } = this.state;
    return !(
      JSON.stringify(initialProfile) === JSON.stringify(profile) &&
      initialAvatar === avatar &&
      backdrop === initialBackdrop
    );
  }

  async updateUser(initial: Profile, newProfile: Profile) {
    const { onSave, profile } = this.props;
    if (!this.hasChanged()) {
      Alert.alert('No changes');
    } else if (
      !newProfile.username ||
      newProfile.username.length < 5 ||
      str.whiteSpaceRegex.test(newProfile.username)
    ) {
      Alert.alert('Sorry', 'Username must be at least 5 characters long and cannot contain any spaces');
    } else {
      this.setState({ spinner: true });
      await this.checkImages();
      delete newProfile.avatar;
      try {
        await firebase
          .database()
          .ref(`users/${profile.uid}`)
          .set({ ...newProfile });
        initial.username &&
          (await firebase
            .database()
            .ref('usernames')
            .child(initial.username)
            .remove());
        await firebase
          .database()
          .ref('usernames')
          .child(profile.username)
          .set(profile.uid);
        Alert.alert('Success', 'Profile saved');
        /* we need to make sure the username is saved locally 
        which is why this calls fetchProfile which saves the username */
        onSave();
        this.setState({ spinner: false });
      } catch (e) {
        Alert.alert('Error', 'That username may have already been taken');
        this.setState({ spinner: false });
      }
    }
  }

  render() {
    const { gym, navigation } = this.props;
    const {
      initialAvatar,
      initialProfile,
      initialBackdrop,
      backdrop,
      email,
      profile,
      avatar,
      spinner,
      showPicker,
    } = this.state;
    return (
      <>
        <Header
          left={
            this.hasChanged() && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 8, bottom: 0, left: 0, justifyContent: 'center', paddingLeft: 10 }}
                onPress={() => {
                  this.setState({
                    profile: initialProfile,
                    avatar: initialAvatar,
                    backdrop: initialBackdrop,
                  });
                }}
              >
                <Text style={{ color: '#fff' }}>UNDO</Text>
              </TouchableOpacity>
            )
          }
          title="Profile"
          right={
            this.hasChanged() && (
              <TouchableOpacity
                onPress={() => {
                  this.updateUser(initialProfile, profile);
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
              {backdrop ? (
                <Image style={{ height: 150 }} resizeMode="cover" source={{ uri: backdrop }} />
              ) : (
                <View style={{ height: 150, backgroundColor: colors.primaryLighter, justifyContent: 'center' }}>
                  <Icon name="ios-add" size={25} style={{ color: '#fff', textAlign: 'center' }} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={[{ marginTop: -45 }, globalStyles.shadow]} onPress={() => this.selectAvatar()}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
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
                {'Email: '}
                <Text style={{ color: colors.secondary }}>{email}</Text>
              </Text>
              <Text style={{ color: '#999', marginHorizontal: 20, marginBottom: gym ? 0 : 10 }}>
                {'Account type: '}
                <Text style={{ color: colors.secondary }}>{profile && profile.accountType}</Text>
              </Text>
              {gym && (
                <TouchableOpacity onPress={() => navigation.navigate('Gym', { id: gym.place_id })}>
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
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={{ color: colors.secondary, marginRight: 10 }}>Settings</Text>
                <Icon size={25} name="md-settings" style={{ color: colors.secondary }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Username: </Text>
            <TextInput
              value={profile && profile.username}
              onChangeText={username => this.setState({ profile: { ...profile, username } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>First name: </Text>
            <TextInput
              value={profile && profile.first_name}
              onChangeText={name => this.setState({ profile: { ...profile, first_name: name } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Last name: </Text>
            <TextInput
              value={profile && profile.last_name}
              onChangeText={name => this.setState({ profile: { ...profile, last_name: name } })}
              placeholderTextColor="#fff"
              style={styles.input}
              autoCapitalize="none"
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
              hideIcon
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
                  profile: { ...profile, activity: value },
                });
              }}
              // style={{ ...pickerSelectStyles }}
              value={profile ? profile.activity : null}
            />
          </View>
          {profile && profile.activity && (
            <View style={styles.inputGrp}>
              <Text style={{ alignSelf: 'center' }}>Level: </Text>
              <RNPickerSelect
                placeholder={{
                  label: 'Unspecified',
                  value: null,
                }}
                hideIcon
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
                    profile: { ...profile, level: value },
                  });
                }}
                // style={{ ...pickerSelectStyles }}
                value={profile.level}
              />
            </View>
          )}
          <View style={styles.inputGrp}>
            <Text style={{ alignSelf: 'center' }}>Birthday: </Text>
          </View>
          <Button style={styles.logout} text="Log out" onPress={() => this.logout()} />
          {spinner && (
            <View style={hStyles.spinner}>
              <PulseIndicator color={colors.secondary} />
            </View>
          )}
        </ScrollView>
        {showPicker && (
          <DateTimePicker
            mode="date"
            value={new Date(profile && profile.birthday)}
            maximumDate={new Date()}
            onChange={date => this.setState({ profile: { ...profile, birthday: date } })}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile,
  gym: profile.gym,
});

const mapDispatchToProps = dispatch => ({
  onLogoutPress: () => dispatch(setLoggedOut()),
  onSave: () => dispatch(fetchProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
