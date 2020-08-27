import React, {Component} from 'react';
import {
  Alert,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import moment from 'moment';
import {equals} from 'ramda';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
//import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
//import RNPickerSelect from 'react-native-picker-select';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import styles from '../styles/profileStyles';
import hStyles from '../styles/homeStyles';
import globalStyles from '../styles/globalStyles';
import {fetchProfile, setLoggedOut} from '../actions/profile';
import {pickerItems, getBirthdayDate} from '../constants/utils';
import str from '../constants/strings';
import ProfileProps from '../types/views/Profile';
import Profile from '../types/Profile';
import {
  Text,
  Button,
  Input,
  Spinner,
  Layout,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';

const activities = [
  'Bodybuilding',
  'Powerlifting',
  'Swimming',
  'Cycling',
  'Running',
  'Sprinting',
];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

interface State {
  spinner: boolean;
  email: string;
  profile: Profile;
  initialProfile: Profile;
  showPicker?: boolean;
}
class ProfileView extends Component<ProfileProps, State> {
  constructor(props) {
    super(props);
    const {profile} = this.props;
    this.state = {
      email: profile.email,
      profile,
      initialProfile: profile,
      spinner: false,
    };
  }

  async componentDidMount() {
    const {profile} = this.props;
    this.listenForUserChanges(database().ref(`users/${profile.uid}`));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.profile) {
      const {profile} = nextProps;
      this.setState({
        profile,
        initialProfile: profile,
        initialAvatar: profile.avatar,
      });
    }
  }

  listenForUserChanges(ref) {
    ref.on('value', (snapshot) => {
      const profile = snapshot.val();
      this.setState({initialProfile: profile});
      this.setState({profile});
    });
  }

  logout() {
    const {profile, onLogoutPress, navigation} = this.props;
    Alert.alert('Log out', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel logout'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          navigation.navigate('Login');
          onLogoutPress();
          try {
            this.setState({spinner: true});
            await database()
              .ref(`users/${profile.uid}`)
              .child('state')
              .remove();
            // await firebase.messaging().deleteToken();
            await auth().signOut();
            this.setState({spinner: false});
          } catch (e) {
            Alert.alert('Error', e.message);
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
    this.setState({spinner: true});
    ImagePicker.showImagePicker(options, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({spinner: false});
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        this.setState({spinner: false});
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        this.setState({spinner: false});
      } else {
        const source = {uri: response.uri};

        const size = 640;
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        const resized = await ImageResizer.createResizedImage(
          response.uri,
          size,
          size,
          'JPEG',
          100,
        );
        // response.uri is the URI of the new image that can now be displayed, uploaded...
        // response.path is the path of the new image
        // response.name is the name of the new image with the extension 
        // response.size is the size of the new image
        const {profile} = this.state;
        if (backdrop) {
          this.setState({profile: {...profile, backdrop: resized.uri}});
        } else {
          this.setState({profile: {...profile, avatar: resized.uri}});
        }
        this.setState({spinner: false});
      }
    });
  }

  uploadImage(
    uri: string,
    backdrop = false,
    mime = 'application/octet-stream',
  ): Promise<string> {
    const {profile} = this.props;
    return new Promise((resolve, reject) => {
      const imageRef = storage()
        .ref(`images/${profile.uid}`)
        .child(backdrop ? 'backdrop' : 'avatar');
      return imageRef
        .putFile(uri, {contentType: mime})
        .then(() => {
          return imageRef.getDownloadURL();
        })
        .then((url) => {
          resolve(url);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async checkImages() {
    const {avatar, backdrop} = this.state.profile;
    const {
      avatar: initialAvatar,
      backdrop: initialBackdrop,
    } = this.state.initialProfile;

    try {
      if (initialAvatar !== avatar) {
        const url = await this.uploadImage(avatar);
      }
      if (initialBackdrop !== backdrop) {
        const url = await this.uploadImage(backdrop, true);
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  hasChanged() {
    const {initialProfile, profile} = this.state;
    return !equals(initialProfile, profile);
  }

  async updateUser(initial: Profile, newProfile: Profile) {
    const {onSave} = this.props;
    if (!this.hasChanged()) {
      Alert.alert('No changes');
    } else if (
      !newProfile.username ||
      newProfile.username.length < 5 ||
      str.whiteSpaceRegex.test(newProfile.username)
    ) {
      Alert.alert(
        'Sorry',
        'Username must be at least 5 characters long and cannot contain any spaces',
      );
    } else {
      this.setState({spinner: true});
      await this.checkImages();
      delete newProfile.avatar;
      try {
        await database()
          .ref(`users/${newProfile.uid}`)
          .set({...newProfile});
        initial.username &&
          (await database().ref('usernames').child(initial.username).remove());
        await database()
          .ref('usernames')
          .child(newProfile.username)
          .set(newProfile.uid);
        Alert.alert('Success', 'Profile saved');
        /* we need to make sure the username is saved locally
        which is why this calls fetchProfile which saves the username */
        onSave();
        this.setState({spinner: false});
      } catch (e) {
        Alert.alert('Error', 'That username may have already been taken');
        this.setState({spinner: false});
      }
    }
  }

  render() {
    const {gym, navigation} = this.props;
    const {initialProfile, email, profile, spinner, showPicker} = this.state;
    const birthday = getBirthdayDate(profile.birthday);
    const birthdayString = birthday
      ? moment(birthday).format('DD/MM/YYYY')
      : '';
    return (
      <Layout style={{flex: 1}}>
        {/* <Header
          left={
            this.hasChanged() && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 8,
                  bottom: 0,
                  left: 0,
                  justifyContent: 'center',
                  paddingLeft: 10,
                }}
                onPress={() => {
                  this.setState({
                    profile: initialProfile,
                    avatar: initialAvatar,
                    backdrop: initialBackdrop,
                  });
                }}>
                <Text style={{color: '#fff'}}>UNDO</Text>
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
                style={{backgroundColor: 'transparent', elevation: 0}}>
                <Text style={{color: '#fff'}}>SAVE</Text>
              </TouchableOpacity>
            )
          }
        /> */}
        <ScrollView>
          <Layout style={{alignItems: 'center', marginBottom: 10, flex: 1}}>
            <TouchableOpacity
              style={{width: '100%'}}
              onPress={() => this.selectAvatar(true)}>
              {profile.backdrop ? (
                <Image
                  style={{height: 150}}
                  resizeMode="cover"
                  source={{uri: profile.backdrop}}
                />
              ) : (
                <View
                  style={{
                    height: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ThemedIcon name="plus" size={25} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[{marginTop: -45}]}
              onPress={() => this.selectAvatar()}>
              {profile.avatar ? (
                <Image
                  source={{uri: profile.avatar}}
                  style={{
                    width: 90,
                    height: 90,
                    alignSelf: 'center',
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ThemedIcon name="plus" size={25} />
                </View>
              )}
            </TouchableOpacity>
          </Layout>

          <Layout
            style={{
              flex: 1,
              marginRight: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{width: '60%'}}>
              <Text>
                {'Email: '}
                <Text>{email}</Text>
              </Text>
              <Text
                style={{
                  marginHorizontal: 20,
                  marginBottom: gym ? 0 : 10,
                }}>
                {'Account type: '}
                <Text>{profile && profile.accountType}</Text>
              </Text>
              {gym && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Gym', {id: gym.place_id})
                  }>
                  <Text
                    style={{
                      marginHorizontal: 20,
                      marginBottom: 10,
                    }}>
                    {'Gym: '}
                    <Text>{gym.name}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{flex: 1, marginRight: 20}}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => navigation.navigate('Settings')}>
                <Text style={{marginRight: 10}}>Settings</Text>
                <ThemedIcon size={25} name="settings" />
              </TouchableOpacity>
            </View>
          </Layout>
          <Input
            value={profile && profile.username}
            onChangeText={(username) =>
              this.setState({profile: {...profile, username}})
            }
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            value={profile && profile.first_name}
            onChangeText={(name) =>
              this.setState({profile: {...profile, first_name: name}})
            }
            placeholder="First name"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            value={profile && profile.last_name}
            onChangeText={(name) =>
              this.setState({profile: {...profile, last_name: name}})
            }
            placeholder="Last name"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View>
            <Text style={{alignSelf: 'center'}}>Preferred activity: </Text>
            {/* <RNPickerSelect
              placeholder={{
                label: 'Unspecified',
                value: null,
              }}
              hideIcon
              items={pickerItems(activities)}
              style={{
                underline: {opacity: 0},
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
              onValueChange={(value) => {
                this.setState({
                  profile: {...profile, activity: value},
                });
              }}
              // style={{ ...pickerSelectStyles }}
              value={profile ? profile.activity : null}
            /> */}
            <Select
              selectedIndex={
                new IndexPath(
                  activities.findIndex((a) => a === profile.activity),
                )
              }>
              {activities.map((activity) => (
                <SelectItem key={activity} title={activity} />
              ))}
            </Select>
          </View>
          {profile && profile.activity && (
            <View>
              <Text style={{alignSelf: 'center'}}>Level: </Text>
              {/* <RNPickerSelect
                placeholder={{
                  label: 'Unspecified',
                  value: null,
                }}
                hideIcon
                items={pickerItems(levels)}
                style={{
                  underline: {opacity: 0},
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
                onValueChange={(value) => {
                  this.setState({
                    profile: {...profile, level: value},
                  });
                }}
                // style={{ ...pickerSelectStyles }}
                value={profile.level}
              /> */}
              <Select selectedIndex={new IndexPath(0)}>
                {levels.map((level) => (
                  <SelectItem key={level} title={level} />
                ))}
              </Select>
            </View>
          )}
          <TouchableOpacity onPress={() => this.setState({showPicker: true})}>
            <Text style={{alignSelf: 'center'}}>
              <Text>Birthday: </Text>
              <Text>{birthdayString}</Text>
            </Text>
          </TouchableOpacity>
          <Layout style={{flex: 1, alignItems: 'flex-end'}}>
            <Button
              style={{alignSelf: 'center'}}
              status="danger"
              onPress={() => this.logout()}>
              Log out
            </Button>
          </Layout>
          {spinner && (
            <View style={hStyles.spinner}>
              <Spinner />
            </View>
          )}
        </ScrollView>
        {showPicker && (
          <>
            {/* <DateTimePicker
              mode="date"
              value={birthday ? birthday.toDate() : new Date()}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  this.setState({
                    profile: {
                      ...profile,
                      birthday: moment(selectedDate).format('DD/MM/YYYY'),
                    },
                    showPicker: Platform.OS === 'ios',
                  });
                }
              }}
            /> */}
            {Platform.OS === 'ios' && (
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() =>
                    this.setState({
                      showPicker: false,
                      profile: {...profile, birthday: initialProfile.birthday},
                    })
                  }>
                  <Text style={{fontSize: 16}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() => this.setState({showPicker: false})}>
                  <Text style={{fontSize: 16}}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Layout>
    );
  }
}

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
  gym: profile.gym,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  onLogoutPress: () => dispatch(setLoggedOut()),
  onSave: () => dispatch(fetchProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
