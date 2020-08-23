import React, {Component} from 'react';
import {
  Alert,
  View,
  TextInput,
  Platform,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import Image from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {connect} from 'react-redux';
import colors from '../constants/colors';
import styles from '../styles/friendsStyles';
import {getStateColor, sortByState} from '../constants/utils';
import Header from '../components/Header/header';
import Text from '../components/Text';
import Button from '../components/Button';
import {
  fetchFriends,
  sendRequest,
  acceptRequest,
  deleteFriend,
} from '../actions/friends';
import FriendsProps from '../types/views/Friends';

interface State {
  refreshing: boolean;
  modalOpen?: boolean;
  username?: string;
}
class Friends extends Component<FriendsProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Pals',
    tabBarIcon: ({tintColor}) => (
      <Icon name="md-people" size={25} style={{color: tintColor}} />
    ),
  };

  async refresh() {
    const {profile, getFriends} = this.props;
    if (profile.friends) {
      this.setState({refreshing: true});
      await getFriends(profile.uid);
      this.setState({refreshing: false});
    }
  }

  async remove(friend) {
    const {onRemove} = this.props;
    try {
      await onRemove(friend);
      this.setState({modalOpen: false});
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async sendRequest(username) {
    const {profile, onRequest} = this.props;
    if (username !== profile.username) {
      try {
        const snapshot = await firebase
          .database()
          .ref(`usernames/${username}`)
          .once('value');
        if (snapshot.val()) {
          const status = await firebase
            .database()
            .ref(`userFriends/${profile.uid}`)
            .child(snapshot.val())
            .once('value');
          if (status.val()) {
            Alert.alert('Sorry', "You've already added this user as a pal");
          } else {
            await onRequest(snapshot.val());
            Alert.alert('Success', 'Request sent');
            this.setState({modalOpen: false});
          }
        } else {
          Alert.alert('Sorry', 'Username does not exist');
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    } else {
      Alert.alert('Error', 'You cannot add yourself as a pal');
    }
  }

  async openChat(uid, username) {
    const {profile, navigation} = this.props;
    try {
      const snapshot = await firebase
        .database()
        .ref(`userChats/${profile.uid}`)
        .child(uid)
        .once('value');
      if (snapshot.val()) {
        navigation.navigate('Messaging', {
          chatId: snapshot.val(),
          friendUsername: username,
          friendUid: uid,
        });
      } else {
        Alert.alert(
          'Error',
          'You should not be seeing this error message, please contact support',
        );
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  renderFriends() {
    const {friends, profile, onAccept, navigation} = this.props;
    const {refreshing} = this.state;
    return (
      <FlatList
        style={{backgroundColor: colors.bgColor}}
        data={sortByState(Object.values(friends))}
        keyExtractor={(friend) => friend.uid}
        onRefresh={() => this.refresh()}
        refreshing={refreshing}
        renderItem={({item}) => {
          if (item.status === 'outgoing') {
            return (
              <View
                style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      marginHorizontal: 10,
                      flex: 1,
                    }}>{`${item.username} request sent`}</Text>
                  <TouchableOpacity
                    style={{marginTop: Platform.OS === 'ios' ? -5 : 0}}
                    onPress={() => {
                      Alert.alert('Cancel Pal request', 'Are you sure?', [
                        {text: 'Cancel', style: 'cancel'},
                        {text: 'OK', onPress: () => this.remove(item.uid)},
                      ]);
                    }}>
                    <Icon
                      name="ios-close"
                      size={50}
                      style={{color: colors.appRed, paddingHorizontal: 10}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          if (item.status === 'incoming') {
            return (
              <View
                style={{
                  paddingVertical: 20,
                  paddingHorizontal: 15,
                  backgroundColor: '#fff',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 40,
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      marginRight: 5,
                      flex: 4,
                    }}>{`${item.username} has sent you a pal request`}</Text>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <TouchableOpacity
                      onPress={() => onAccept(profile.uid, item.uid)}>
                      <Icon
                        size={50}
                        name="ios-checkmark"
                        style={{
                          color: 'green',
                          paddingHorizontal: 10,
                          alignSelf: 'center',
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.remove(item.uid)}>
                      <Icon
                        size={50}
                        name="ios-close"
                        style={{
                          color: colors.appRed,
                          paddingHorizontal: 10,
                          alignSelf: 'center',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }
          if (item.status === 'connected') {
            return (
              <View
                style={{
                  backgroundColor: '#fff',
                  marginBottom: 1,
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 50,
                    justifyContent: 'space-between',
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {item.avatar ? (
                      <Image
                        source={{uri: item.avatar}}
                        style={{height: 50, width: 50, borderRadius: 25}}
                      />
                    ) : (
                      <Icon
                        size={65}
                        name="md-contact"
                        style={{
                          color: colors.primary,
                          marginTop: Platform.OS === 'ios' ? -10 : 0,
                        }}
                      />
                    )}
                    <Text style={{marginHorizontal: 10}}>{item.username}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    {item.state && (
                      <Text
                        style={{
                          color: getStateColor(item.state),
                          alignSelf: 'center',
                          marginRight: 10,
                        }}>
                        {item.state}
                      </Text>
                    )}
                    {item.state && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: getStateColor(item.state),
                          alignSelf: 'center',
                        }}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => this.openChat(item.uid, item.username)}
                      style={{padding: 5, marginHorizontal: 5}}>
                      <Icon
                        size={30}
                        name="md-chatboxes"
                        style={{color: colors.secondary}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ProfileView', {uid: item.uid})
                      }
                      style={{padding: 5, marginHorizontal: 5}}>
                      <Icon
                        size={30}
                        name="md-person"
                        style={{color: colors.secondary}}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }
          return null;
        }}
      />
    );
  }

  render() {
    const {profile, friends} = this.props;
    const {username, modalOpen} = this.state;
    const addButton = (
      <TouchableOpacity
        onPress={() => {
          profile.username
            ? this.setState({modalOpen: true})
            : Alert.alert('Please set a username before trying to add a pal');
        }}>
        <Icon name="md-add" size={25} style={{color: '#fff', padding: 5}} />
      </TouchableOpacity>
    );
    return (
      <>
        <Header title="Pals" right={addButton} />
        {Object.values(friends).length > 0 ? (
          this.renderFriends()
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 20,
            }}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
              You don't have any pals yet, also please make sure you are
              connected to the internet
            </Text>
          </View>
        )}
        <Modal
          backButtonClose
          backdropPressToClose={false}
          style={styles.modal}
          position="center"
          isOpen={modalOpen}
          key={modalOpen ? 1 : 2}>
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
            Send pal request
          </Text>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.usernameInput}
              autoCapitalize="none"
              placeholder="Enter username"
              value={username}
              onChangeText={(u) => this.setState({username: u})}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginBottom: 10,
            }}>
            <Button
              onPress={() => this.setState({modalOpen: false})}
              text="Cancel"
              color={colors.appRed}
            />
            <Button onPress={() => this.sendRequest(username)} text="Submit" />
          </View>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = ({friends, profile}) => ({
  friends: friends.friends,
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch) => ({
  getFriends: (uid: string, limit?: number, startAt?: string) =>
    dispatch(fetchFriends(uid, limit, startAt)),
  onRequest: (friendUid) => dispatch(sendRequest(friendUid)),
  onAccept: (uid, friendUid) => dispatch(acceptRequest(uid, friendUid)),
  onRemove: (uid) => dispatch(deleteFriend(uid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
