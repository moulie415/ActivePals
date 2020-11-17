import React, {Component, FunctionComponent, useEffect, useState} from 'react';
import {pathOr} from 'ramda';
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import {connect} from 'react-redux';
import ImageViewer from 'react-native-image-zoom-viewer';
import Image from 'react-native-fast-image';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import hStyles from '../styles/homeStyles';
import {
  calculateAge,
  getBirthdayDate,
  getFormattedBirthday,
} from '../constants/utils';
import globalStyles from '../styles/globalStyles';
import {deleteFriend, sendRequest} from '../actions/friends';
import ProfileViewProps from '../types/views/ProfileView';
import Profile from '../types/Profile';
import Place from '../types/Place';
import {
  Button,
  Text,
  Spinner,
  Layout,
  ListItem,
  Divider,
} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import {fetchUser, fetchUsers} from '../actions/home';
import Avatar from '../components/Avatar/Avatar';

interface State {
  profile?: Profile;
  loaded: boolean;
  isFriend: boolean;
  showImage: boolean;
  gym?: Place;
  backdrop?: string;
  avatar?: string;
  selectedImage?: {url: string}[];
}
const ProfileView: FunctionComponent<ProfileViewProps> = ({
  route,
  navigation,
  remove,
  request,
  friends,
  users,
}) => {
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string}[]>();
  const [isFriend, setIsFriend] = useState(false);
  const {uid} = route.params;
  useEffect(() => {
    if (friends[uid]) {
      setIsFriend(true);
    } else {
      fetchUser(uid);
    }
  }, [uid, friends]);

  const user = friends[uid] || users[uid];

  return (
    <>
      {user ? (
        <Layout style={{flex: 1, justifyContent: 'space-between'}}>
          <Layout>
            <Layout style={{alignItems: 'center', marginBottom: 10}}>
              {user.backdrop ? (
                <TouchableOpacity
                  style={{height: 150, width: '100%'}}
                  onPress={() => {
                    setSelectedImage([{url: user.backdrop}]);
                    setShowImage(true);
                  }}>
                  <Image
                    style={{height: 150, width: '100%'}}
                    resizeMode="cover"
                    source={{uri: user.backdrop}}
                  />
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    height: 150,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                />
              )}
              {user.avatar ? (
                <TouchableOpacity
                  style={{
                    marginTop: -45,
                    marginHorizontal: 20,
                  }}
                  onPress={() => {
                    setSelectedImage([{url: user.avatar}]);
                    setShowImage(true);
                  }}>
                  <Avatar uri={user.avatar} size={90} />
                </TouchableOpacity>
              ) : (
                <ThemedIcon
                  name="person"
                  size={80}
                  style={{
                    marginTop: -45,
                    textAlign: 'center',
                    marginBottom: 10,
                    paddingHorizontal: 10,
                    paddingTop: Platform.OS === 'ios' ? 5 : 0,
                  }}
                />
              )}
            </Layout>

            <Text
              style={{
                alignSelf: 'center',
                fontSize: 15,
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: 10,
              }}>
              <Text>{`${user.username} `}</Text>
              {(user.first_name || user.last_name) && (
                <Text style={{marginLeft: 10, marginVertical: 5}}>
                  {user.first_name && (
                    <Text>{`${user.first_name}${
                      user.last_name ? ' ' : ''
                    }`}</Text>
                  )}
                  {user.last_name && <Text>{user.last_name}</Text>}
                </Text>
              )}
            </Text>
            {!isFriend && (
              <Button
                onPress={() => {
                  Alert.alert('Send pal request', 'Are you sure?', [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Yes',
                      onPress: async () => {
                        try {
                          await request(uid);
                          navigation.goBack();
                          Alert.alert('Success', 'Request sent');
                        } catch (e) {
                          Alert.alert('Error', e.message);
                        }
                      },
                      style: 'destructive',
                    },
                  ]);
                }}
                style={{margin: 10, alignSelf: 'center'}}>
                Send pal request
              </Button>
            )}

            {user.accountType && isFriend && (
              <>
                <Divider />
                <ListItem title="Account type" description={user.accountType} />
                <Divider />
              </>
            )}

            {user.gym && user.gym.name && isFriend && (
              <>
                <ListItem
                  onPress={() =>
                    navigation.navigate('Gym', {id: user.gym.place_id})
                  }
                  title="Gym"
                  description={user.gym.name}
                />
                <Divider />
              </>
            )}

            {user.birthday && isFriend && (
              <>
                <ListItem
                  title="Birthday"
                  description={`${user.birthday} (${calculateAge(
                    getBirthdayDate(user.birthday),
                  )})`}
                />
                <Divider />
              </>
            )}

            {isFriend && (
              <>
                <ListItem
                  title="Preferred activity"
                  description={user.activity || 'Unspecified'}
                />
                <Divider />
              </>
            )}

            {user.activity && isFriend && (
              <>
                <ListItem
                  title="Level"
                  description={user.level || 'Unspecified'}
                />
                <Divider />
              </>
            )}
          </Layout>

          {isFriend && (
            <Button
              status="danger"
              style={{alignSelf: 'center', margin: 10}}
              onPress={() => {
                Alert.alert('Remove pal', 'Are you sure?', [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Yes',
                    onPress: async () => {
                      await remove(uid);
                      navigation.goBack();
                    },
                    style: 'destructive',
                  },
                ]);
              }}>
              Remove pal
            </Button>
          )}
        </Layout>
      ) : (
        <View style={hStyles.spinner}>
          <Spinner />
        </View>
      )}
      <Modal onRequestClose={() => null} visible={showImage} transparent>
        <ImageViewer
          renderIndicator={(currentIndex, allSize) => null}
          loadingRender={() => (
            <SafeAreaView>
              <Text style={{color: '#fff', fontSize: 20}}>Loading...</Text>
            </SafeAreaView>
          )}
          renderHeader={() => {
            return (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 10,
                  padding: 10,
                  zIndex: 9999,
                }}
                onPress={() => {
                  setSelectedImage([]);
                  setShowImage(false);
                }}>
                <View
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}>
                  <ThemedIcon name="arrow-ios-back" size={40} />
                </View>
              </TouchableOpacity>
            );
          }}
          imageUrls={selectedImage}
        />
      </Modal>
    </>
  );
};

const mapStateToProps = ({friends, sharedInfo, profile}: MyRootState) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  remove: (uid: string) => dispatch(deleteFriend(uid)),
  request: (friendUid: string) => dispatch(sendRequest(friendUid)),
  fetchUser: (uid: string) => dispatch(fetchUsers([uid])),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
