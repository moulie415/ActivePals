import React, {Component} from 'react';
import {Alert, View, ScrollView, TouchableOpacity} from 'react-native';
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
import hStyles from '../styles/homeStyles';
import {fetchProfile, setLoggedOut} from '../actions/profile';
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
  ListItem,
  Divider,
  Datepicker,
  withStyles,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {getBirthdayDate} from '../constants/utils';

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
    const {avatar, backdrop, uid} = this.state.profile;
    const {
      avatar: initialAvatar,
      backdrop: initialBackdrop,
    } = this.state.initialProfile;

    try {
      if (initialAvatar !== avatar) {
        const url = await this.uploadImage(avatar);
        await database().ref('users').child(uid).update({avatar: url});
        this.setState({
          profile: {...this.state.profile, avatar: url},
          initialProfile: {...this.state.initialProfile, avatar: url},
        });
      }
      if (initialBackdrop !== backdrop) {
        const url = await this.uploadImage(backdrop, true);
        await database().ref('users').child(uid).update({backdrop: url});
        this.setState({
          profile: {...this.state.profile, backdrop: url},
          initialProfile: {...this.state.initialProfile, backdrop: url},
        });
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

    return (
      <ScrollView
        style={{
          backgroundColor: this.props.eva.theme[
            'background-basic-color-1'
          ],
        }}>
        <Layout style={{flex: 1}}>
          <Layout style={{alignItems: 'center', marginBottom: 10}}>
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

          <Layout style={{flex: 1}}>
            {this.hasChanged() && (
              <>
                <Divider />
                <Layout
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    padding: 10,
                  }}>
                  <Button
                    onPress={() => {
                      this.setState({
                        profile: initialProfile,
                      });
                    }}>
                    Undo
                  </Button>

                  <Button
                    onPress={() => {
                      this.updateUser(initialProfile, profile);
                    }}>
                    Save
                  </Button>
                </Layout>
              </>
            )}
            <Divider />
            <ListItem title="Email" description={email} disabled />
            <Divider />
            <ListItem
              title="Account type"
              description={profile.accountType}
              disabled
            />
            <Divider />
            {gym && (
              <>
                <ListItem
                  onPress={() => navigation.navigate('Gym', {id: gym.place_id})}
                  title="Gym"
                  description={gym.name}
                  accessoryRight={() => (
                    <ThemedIcon size={25} name="arrow-ios-forward" />
                  )}
                />
                <Divider />
              </>
            )}
            <ListItem
              onPress={() => navigation.navigate('Settings')}
              title="Settings"
              accessoryLeft={() => <ThemedIcon size={25} name="settings" />}
              accessoryRight={() => (
                <ThemedIcon size={25} name="arrow-ios-forward" />
              )}
            />
            <Divider />
            <Layout style={{margin: 10}}>
              <Input
                style={{marginBottom: 10}}
                accessoryLeft={() => <Text category="label">Username</Text>}
                value={profile && profile.username}
                onChangeText={(username) =>
                  this.setState({profile: {...profile, username}})
                }
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                style={{marginBottom: 10}}
                accessoryLeft={() => <Text category="label">First name</Text>}
                value={profile && profile.first_name}
                onChangeText={(name) =>
                  this.setState({profile: {...profile, first_name: name}})
                }
                placeholder="First name"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                style={{marginBottom: 10}}
                accessoryLeft={() => <Text category="label">Last name</Text>}
                value={profile && profile.last_name}
                onChangeText={(name) =>
                  this.setState({profile: {...profile, last_name: name}})
                }
                placeholder="Last name"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Select
                style={{marginBottom: 10}}
                accessoryLeft={() => (
                  <Text category="label">Preferred activity</Text>
                )}
                selectedIndex={
                  new IndexPath(
                    activities.findIndex((a) => a === profile.activity),
                  )
                }>
                {activities.map((activity) => (
                  <SelectItem key={activity} title={activity} />
                ))}
              </Select>

              {profile && profile.activity && (
                <Select
                  style={{marginBottom: 10}}
                  accessoryLeft={() => <Text category="label">Level</Text>}
                  selectedIndex={new IndexPath(0)}>
                  {levels.map((level) => (
                    <SelectItem key={level} title={level} />
                  ))}
                </Select>
              )}
              <Datepicker
                style={{marginBottom: 10}}
                accessoryLeft={() => <Text category="label">Birthday</Text>}
                date={
                  profile.birthday &&
                  getBirthdayDate(profile.birthday)?.toDate()
                }
                min={new Date('01/01/1900')}
                max={new Date()}
                onSelect={(nextDate) =>
                  this.setState({profile: {...profile, birthday: nextDate}})
                }
              />
            </Layout>

            <Layout
              style={{flex: 1, justifyContent: 'flex-end', marginBottom: 10}}>
              <Button
                style={{alignSelf: 'center'}}
                status="danger"
                onPress={() => this.logout()}>
                Log out
              </Button>
            </Layout>
          </Layout>

          {spinner && (
            <View style={hStyles.spinner}>
              <Spinner />
            </View>
          )}
        </Layout>
      </ScrollView>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(ProfileView));
