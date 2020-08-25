import React, {Component} from 'react';
import {pathOr} from 'ramda';
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import ImageViewer from 'react-native-image-zoom-viewer';
import Image from 'react-native-fast-image';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import hStyles from '../styles/homeStyles';
import {calculateAge, getFormattedBirthday} from '../constants/utils';
import globalStyles from '../styles/globalStyles';
import {deleteFriend, sendRequest} from '../actions/friends';
import ProfileViewProps from '../types/views/ProfileView';
import Profile from '../types/Profile';
import Place from '../types/Place';
import {Button, Text} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {MyRootState, MyThunkDispatch} from '../types/Shared';

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
class ProfileView extends Component<ProfileViewProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      isFriend: false,
      showImage: false,
      loaded: false,
    };
  }

  componentDidMount() {
    // TODO update friend in redux
    const {
      friends,
      route: {
        params: {uid},
      },
    } = this.props;
    storage()
      .ref(`images/${uid}`)
      .child('backdrop')
      .getDownloadURL()
      .then((backdrop) => this.setState({backdrop}))
      .catch((e) => console.log(e));

    storage()
      .ref(`images/${uid}`)
      .child('avatar')
      .getDownloadURL()
      .then((avatar) => this.setState({avatar}))
      .catch((e) => console.log(e));

    database()
      .ref(`users/${uid}`)
      .once('value', (user) => {
        this.setState({profile: user.val()});
        if (user.val().gym) {
          database()
            .ref(`gyms/${user.val().gym}`)
            .once('value', (gym) => {
              this.setState({gym: gym.val(), loaded: true});
            });
        } else {
          this.setState({loaded: true});
        }
        if (friends[user.val().uid]) {
          this.setState({isFriend: true});
        }
      });
  }

  render() {
    const {remove, request, navigation} = this.props;
    const {
      loaded,
      backdrop,
      avatar,
      isFriend,
      gym,
      showImage,
      selectedImage,
    } = this.state;
    const profile = pathOr({}, ['profile'], this.state);
    const {
      username,
      first_name,
      last_name,
      birthday,
      uid,
      accountType,
      activity,
      level,
    } = profile;
    return (
      <>
        {loaded ? (
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View>
              <View style={{alignItems: 'center', marginBottom: 10}}>
                {backdrop ? (
                  <TouchableOpacity
                    style={{height: 150, width: '100%'}}
                    onPress={() => {
                      this.setState({
                        selectedImage: [{url: backdrop}],
                        showImage: true,
                      });
                    }}>
                    <Image
                      style={{height: 150, width: '100%'}}
                      resizeMode="cover"
                      source={{uri: backdrop}}
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
                {avatar ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        selectedImage: [{url: avatar}],
                        showImage: true,
                      });
                    }}
                    style={[
                      {
                        marginTop: -45,
                        marginHorizontal: 20,
                        borderWidth: 0.5,
                      },
                      globalStyles.shadow,
                    ]}>
                    <Image
                      style={{height: 90, width: 90}}
                      source={{uri: avatar}}
                    />
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
                      borderWidth: 1,
                    }}
                  />
                )}
              </View>

              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 15,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                <Text>{`${username} `}</Text>
                {(first_name || last_name) && (
                  <Text style={{marginLeft: 10, marginVertical: 5}}>
                    {first_name && (
                      <Text>{`${first_name}${last_name ? ' ' : ''}`}</Text>
                    )}
                    {last_name && <Text>{last_name}</Text>}
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

              {accountType && isFriend && (
                <Text style={{marginLeft: 10, marginVertical: 5}}>
                  Account type:
                  <Text>{` ${accountType}`}</Text>
                </Text>
              )}

              {gym && gym.name && isFriend && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Gym', {id: gym.place_id})
                  }>
                  <Text style={{marginLeft: 10, marginVertical: 5}}>
                    Gym:
                    <Text>{` ${gym.name}`}</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {birthday && isFriend && (
                <Text style={{marginLeft: 10, marginVertical: 5}}>
                  <Text style={{marginLeft: 10, marginVertical: 5}}>
                    Birthday:{' '}
                  </Text>
                  <Text>
                    {`${getFormattedBirthday(birthday)} (${calculateAge(
                      new Date(birthday),
                    )})`}
                  </Text>
                </Text>
              )}

              {isFriend && (
                <Text style={{marginLeft: 10, marginVertical: 5}}>
                  {'Preferred activity: '}
                  <Text>{activity || 'Unspecified'}</Text>
                </Text>
              )}

              {activity && isFriend && (
                <Text style={{marginLeft: 10, marginVertical: 5}}>
                  {'Level: '}
                  <Text>{level || 'Unspecified'}</Text>
                </Text>
              )}
            </View>

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
          </View>
        ) : (
          <View style={hStyles.spinner}>
            <ActivityIndicator />
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
                  onPress={() =>
                    this.setState({selectedImage: null, showImage: false})
                  }>
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
  }
}

const mapStateToProps = ({friends, sharedInfo, profile}: MyRootState) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  remove: (uid: string) => dispatch(deleteFriend(uid)),
  request: (friendUid: string) => dispatch(sendRequest(friendUid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
