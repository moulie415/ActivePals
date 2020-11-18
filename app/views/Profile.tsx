import React, {FunctionComponent, useEffect, useState} from 'react';
import {
  Alert,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
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

const ProfileView: FunctionComponent<ProfileProps> = ({
  profile: propsProfile,
  onLogoutPress,
  navigation,
  onSave,
  eva,
  gym,
}) => {
  const [profile, setProfile] = useState(propsProfile);
  const [initialProfile, setInitialProfile] = useState(propsProfile);
  const [spinner, setSpinner] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(new IndexPath(0));
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(
    new IndexPath(0),
  );

  useEffect(() => {
    database()
      .ref(`users/${profile.uid}`)
      .on('value', (snapshot) => {
        const p = snapshot.val();
        setInitialProfile(p);
        setProfile(p);
      });
  }, [profile.uid]);

  const logout = async () => {
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
            setSpinner(true);
            await database()
              .ref(`users/${profile.uid}`)
              .child('state')
              .remove();
            // await firebase.messaging().deleteToken();
            await auth().signOut();
            setSpinner(false);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const selectAvatar = async (backdrop = false) => {
    const options: ImagePickerOptions = {
      title: backdrop ? 'Select Backdrop' : 'Select Avatar',
      mediaType: 'photo',
      noData: true,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    setSpinner(true);
    ImagePicker.showImagePicker(options, async (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        setSpinner(false);
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        setSpinner(false);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        setSpinner(false);
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
        if (backdrop) {
          setProfile({...profile, backdrop: resized.uri});
        } else {
          setProfile({...profile, avatar: resized.uri});
        }
        setSpinner(false);
      }
    });
  };

  const uploadImage = async (
    uri: string,
    backdrop = false,
    mime = 'application/octet-stream',
  ): Promise<string> => {
    const imageRef = storage()
      .ref(`images/${profile.uid}`)
      .child(backdrop ? 'backdrop' : 'avatar');
    await imageRef.putFile(uri, {contentType: mime});
    return imageRef.getDownloadURL();
  };

  const checkImages = async () => {
    const {avatar, backdrop, uid} = profile;
    const {avatar: initialAvatar, backdrop: initialBackdrop} = initialProfile;
    let newAvatar = initialAvatar;
    let newBackDrop = initialBackdrop;
    try {
      if (initialAvatar !== avatar) {
        const url = await uploadImage(avatar);
        await database().ref('users').child(uid).update({avatar: url});
        setProfile({...profile, avatar: url});
        setInitialProfile({...initialProfile, avatar: url});
        newAvatar = url;
      }
      if (initialBackdrop !== backdrop) {
        const url = await uploadImage(backdrop, true);
        await database().ref('users').child(uid).update({backdrop: url});
        setProfile({...profile, backdrop: url});
        setInitialProfile({...initialProfile, backdrop: url});
        newBackDrop = url;
      }
      return {avatar: newAvatar, backdrop: newBackDrop};
    } catch (e) {
      Alert.alert('Error', e.message);
      return {avatar: newAvatar, backdrop: newBackDrop};
    }
  };

  const hasChanged = () => {
    return !equals(initialProfile, profile);
  };

  const updateUser = async (initial: Profile, newProfile: Profile) => {
    if (!hasChanged()) {
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
      setSpinner(true);
      const {avatar, backdrop} = await checkImages();
      try {
        await database()
          .ref(`users/${newProfile.uid}`)
          .set({...newProfile, avatar, backdrop});
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
        setSpinner(false);
      } catch (e) {
        Alert.alert('Error', 'That username may have already been taken');
        setSpinner(false);
      }
    }
  };

  return (
    <ScrollView
      style={{
        backgroundColor: eva.theme['background-basic-color-1'],
      }}>
      <SafeAreaView>
        <Layout style={{flex: 1}}>
          <Layout style={{alignItems: 'center', marginBottom: 10}}>
            <TouchableOpacity
              style={{width: '100%'}}
              onPress={() => selectAvatar(true)}>
              {profile.backdrop ? (
                <Image
                  style={{height: 150}}
                  resizeMode="cover"
                  source={{uri: profile.backdrop}}
                />
              ) : (
                <Layout
                  style={{
                    height: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ThemedIcon name="plus" size={25} />
                </Layout>
              )}
              <Divider />
            </TouchableOpacity>
            <TouchableOpacity
              style={[{marginTop: -45}]}
              onPress={() => selectAvatar()}>
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
            {hasChanged() && (
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
                      setProfile(initialProfile);
                    }}>
                    Undo
                  </Button>

                  <Button
                    onPress={() => {
                      updateUser(initialProfile, profile);
                    }}>
                    Save
                  </Button>
                </Layout>
              </>
            )}
            <Divider />
            <ListItem title="Email" description={profile.email} disabled />
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
                onChangeText={(username) => setProfile({...profile, username})}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                style={{marginBottom: 10}}
                accessoryLeft={() => <Text category="label">First name</Text>}
                value={profile && profile.first_name}
                onChangeText={(name) =>
                  setProfile({...profile, first_name: name})
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
                  setProfile({...profile, last_name: name})
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
                value={profile.activity || 'Select preferred activity'}
                onSelect={(index) => {
                  setSelectedIndex(index as IndexPath);
                  setProfile({
                    ...profile,
                    activity: activities[Number(index) - 1],
                  });
                }}
                selectedIndex={selectedIndex}>
                {activities.map((activity) => (
                  <SelectItem key={activity} title={activity} />
                ))}
              </Select>

              {profile && profile.activity && (
                <Select
                  style={{marginBottom: 10}}
                  value={profile.level || 'Select level'}
                  accessoryLeft={() => <Text category="label">Level</Text>}
                  onSelect={(index) => {
                    setSelectedLevelIndex(index as IndexPath);
                    setProfile({...profile, level: levels[Number(index) - 1]});
                  }}
                  selectedIndex={selectedLevelIndex}>
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
                  setProfile({...profile, birthday: nextDate})
                }
              />
            </Layout>

            <Layout
              style={{flex: 1, justifyContent: 'flex-end', marginBottom: 10}}>
              <Button
                style={{alignSelf: 'center'}}
                status="danger"
                onPress={() => logout()}>
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
      </SafeAreaView>
    </ScrollView>
  );
};

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
