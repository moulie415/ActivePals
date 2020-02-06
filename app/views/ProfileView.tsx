import React, { Component } from 'react';
import { pathOr } from 'ramda';
import { Alert, View, TouchableOpacity, Platform, Modal, SafeAreaView } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { PulseIndicator } from 'react-native-indicators';
import ImageViewer from 'react-native-image-zoom-viewer';
import Image from 'react-native-fast-image';
import firebase from 'react-native-firebase';
import Text, { globalTextStyle } from '../components/Text';
import hStyles from '../styles/homeStyles';
import colors from '../constants/colors';
import { calculateAge, getFormattedBirthday } from '../constants/utils';
import Header from '../components/Header/header';
import globalStyles from '../styles/globalStyles';
import Button from '../components/Button';
import { deleteFriend, sendRequest } from '../actions/friends';
import ProfileViewProps from '../types/views/ProfileView';
import Profile from '../types/Profile';
import Place from '../types/Place';

interface State {
  profile?: Profile;
  loaded: boolean;
  isFriend: boolean;
  showImage: boolean;
  gym?: Place;
  backdrop?: string;
  avatar?: string;
  selectedImage?: { url: string }[];
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
      navigation: {
        state: {
          params: { uid },
        },
      },
    } = this.props;
    firebase
      .storage()
      .ref(`images/${uid}`)
      .child('backdrop')
      .getDownloadURL()
      .then(backdrop => this.setState({ backdrop }))
      .catch(e => console.log(e));

    firebase
      .storage()
      .ref(`images/${uid}`)
      .child('avatar')
      .getDownloadURL()
      .then(avatar => this.setState({ avatar }))
      .catch(e => console.log(e));

    firebase
      .database()
      .ref(`users/${uid}`)
      .once('value', user => {
        this.setState({ profile: user.val() });
        if (user.val().gym) {
          firebase
            .database()
            .ref(`gyms/${user.val().gym}`)
            .once('value', gym => {
              this.setState({ gym: gym.val(), loaded: true });
            });
        } else this.setState({ loaded: true });
        if (friends[user.val().uid]) {
          this.setState({ isFriend: true });
        }
      });
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => <Icon name="md-person" style={{ color: tintColor }} />,
  };

  render() {
    const { remove, request, navigation } = this.props;
    const { loaded, backdrop, avatar, isFriend, gym, showImage, selectedImage } = this.state;
    const profile = pathOr({}, ['profile'], this.state);
    const { username, first_name, last_name, birthday, uid, accountType, activity, level } = profile;
    return (
      <>
        <Header hasBack title={username || 'Profile'} />
        {loaded ? (
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                {backdrop ? (
                  <TouchableOpacity
                    style={{ height: 150, width: '100%' }}
                    onPress={() => {
                      this.setState({ selectedImage: [{ url: backdrop }], showImage: true });
                    }}
                  >
                    <Image style={{ height: 150, width: '100%' }} resizeMode="cover" source={{ uri: backdrop }} />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      height: 150,
                      width: '100%',
                      backgroundColor: colors.primaryLighter,
                      justifyContent: 'center',
                    }}
                  />
                )}
                {avatar ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ selectedImage: [{ url: avatar }], showImage: true });
                    }}
                    style={[
                      { marginTop: -45, marginHorizontal: 20, borderWidth: 0.5, borderColor: '#fff' },
                      globalStyles.shadow,
                    ]}
                  >
                    <Image style={{ height: 90, width: 90 }} source={{ uri: avatar }} />
                  </TouchableOpacity>
                ) : (
                  <Icon
                    name="md-contact"
                    size={80}
                    style={{
                      color: colors.primary,
                      marginTop: -45,
                      textAlign: 'center',
                      backgroundColor: '#fff',
                      marginBottom: 10,
                      paddingHorizontal: 10,
                      paddingTop: Platform.OS === 'ios' ? 5 : 0,
                      borderWidth: 1,
                      borderColor: colors.secondary,
                    }}
                  />
                )}
              </View>

              <Text style={{ alignSelf: 'center', fontSize: 15, textAlign: 'center', fontWeight: 'bold' }}>
                <Text>{`${username} `}</Text>
                {(first_name || last_name) && (
                  <Text style={{ marginLeft: 10, marginVertical: 5 }}>
                    {first_name && <Text>{`${first_name}${last_name ? ' ' : ''}`}</Text>}
                    {last_name && <Text>{last_name}</Text>}
                  </Text>
                )}
              </Text>
              {!isFriend && (
                <Button
                  onPress={() => {
                    Alert.alert('Send pal request', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
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
                  text="Send pal request"
                  style={{ margin: 10, alignSelf: 'center' }}
                />
              )}

              {accountType && isFriend && (
                <Text style={{ color: '#999', marginLeft: 10, marginVertical: 5 }}>
                  Account type:
                  <Text style={{ color: colors.secondary }}>{` ${accountType}`}</Text>
                </Text>
              )}

              {gym && gym.name && isFriend && (
                <TouchableOpacity onPress={() => navigation.navigate('Gym', { id: gym.place_id })}>
                  <Text style={{ color: '#999', marginLeft: 10, marginVertical: 5 }}>
                    Gym:
                    <Text style={{ color: colors.secondary }}>{` ${gym.name}`}</Text>
                  </Text>
                </TouchableOpacity>
              )}

              {birthday && isFriend && (
                <Text style={{ marginLeft: 10, marginVertical: 5 }}>
                  <Text style={{ color: '#999', marginLeft: 10, marginVertical: 5 }}>Birthday: </Text>
                  <Text style={{ color: colors.secondary }}>
                    {`${getFormattedBirthday(birthday)} (${calculateAge(new Date(birthday))})`}
                  </Text>
                </Text>
              )}

              {isFriend && (
                <Text style={{ color: '#999', marginLeft: 10, marginVertical: 5 }}>
                  {'Preferred activity: '}
                  <Text style={{ color: colors.secondary }}>{activity || 'Unspecified'}</Text>
                </Text>
              )}

              {activity && isFriend && (
                <Text style={{ color: '#999', marginLeft: 10, marginVertical: 5 }}>
                  {'Level: '}
                  <Text style={{ color: colors.secondary }}>{level || 'Unspecified'}</Text>
                </Text>
              )}
            </View>

            {isFriend && (
              <Button
                color="red"
                text="Remove pal"
                style={{ alignSelf: 'center', margin: 10 }}
                onPress={() => {
                  Alert.alert('Remove pal', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: async () => {
                        await remove(uid);
                        navigation.goBack();
                      },
                      style: 'destructive',
                    },
                  ]);
                }}
              />
            )}
          </View>
        ) : (
          <View style={hStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <Modal onRequestClose={() => null} visible={showImage} transparent>
          <ImageViewer
            renderIndicator={(currentIndex, allSize) => null}
            loadingRender={() => (
              <SafeAreaView>
                <Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text>
              </SafeAreaView>
            )}
            renderHeader={() => {
              return (
                <TouchableOpacity
                  style={{ position: 'absolute', top: 20, left: 10, padding: 10, zIndex: 9999 }}
                  onPress={() => this.setState({ selectedImage: null, showImage: false })}
                >
                  <View
                    style={{
                      backgroundColor: '#0007',
                      paddingHorizontal: 15,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <Icon name="ios-arrow-back" style={{ color: '#fff', fontSize: 40 }} />
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

const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
});

const mapDispatchToProps = dispatch => ({
  remove: uid => dispatch(deleteFriend(uid)),
  request: friendUid => dispatch(sendRequest(friendUid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView);
