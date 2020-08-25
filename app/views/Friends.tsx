import React, {Component} from 'react';
import {Alert, View, TextInput, Platform, TouchableOpacity} from 'react-native';
import database from '@react-native-firebase/database';
import Image from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import {connect} from 'react-redux';
import styles from '../styles/friendsStyles';
import {getStateColor, sortByState} from '../constants/utils';
import {
  fetchFriends,
  sendRequest,
  acceptRequest,
  deleteFriend,
} from '../actions/friends';
import FriendsProps from '../types/views/Friends';
import {
  Icon,
  Button,
  Text,
  Layout,
  List,
  Divider,
  ListItem,
  Avatar,
} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import { MyRootState, MyThunkDispatch } from '../types/Shared';

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
        const snapshot = await database()
          .ref(`usernames/${username}`)
          .once('value');
        if (snapshot.val()) {
          const status = await database()
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
      const snapshot = await database()
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
      <List
        data={sortByState(Object.values(friends))}
        ItemSeparatorComponent={Divider}
        keyExtractor={(friend) => friend.uid}
        onRefresh={() => this.refresh()}
        refreshing={refreshing}
        renderItem={({item}) => {
          if (item.status === 'outgoing') {
            return (
              <ListItem
                title={`${item.username} request sent`}
                accessoryRight={() => (
                  <TouchableOpacity
                    style={{marginTop: Platform.OS === 'ios' ? -5 : 0}}
                    onPress={() => {
                      Alert.alert('Cancel Pal request', 'Are you sure?', [
                        {text: 'Cancel', style: 'cancel'},
                        {text: 'OK', onPress: () => this.remove(item.uid)},
                      ]);
                    }}>
                    <ThemedIcon name="close" size={50} status="danger" />
                  </TouchableOpacity>
                )}
              />
            );
          }
          if (item.status === 'incoming') {
            return (
              <ListItem
                title={`${item.username} has sent you a pal request`}
                accessoryRight={() => (
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <TouchableOpacity
                      onPress={() => onAccept(profile.uid, item.uid)}>
                      <Icon size={50} name="checkmark" status="positive" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.remove(item.uid)}>
                      <Icon size={50} name="close" status="danger" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            );
          }
          if (item.status === 'connected') {
            return (
              <ListItem
                title={item.username}
                accessoryLeft={() =>
                  item.avatar ? (
                    <Avatar source={{uri: item.avatar}} size="large" />
                  ) : (
                    <Icon
                      size={65}
                      name="person"
                      style={{
                        marginTop: Platform.OS === 'ios' ? -10 : 0,
                      }}
                    />
                  )
                }
                accessoryRight={() => (
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
                      style={{padding: 5, marginLeft: 10}}>
                      <ThemedIcon size={30} name="message-square" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ProfileView', {uid: item.uid})
                      }
                      style={{padding: 5}}>
                      <ThemedIcon size={30} name="person" />
                    </TouchableOpacity>
                  </View>
                )}
              />
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
        <ThemedIcon name="person-add" size={25} style={{padding: 5}} />
      </TouchableOpacity>
    );
    return (
      <Layout>
        {Object.values(friends).length > 0 ? (
          this.renderFriends()
        ) : (
          <Layout
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 20,
            }}>
            <Text style={{textAlign: 'center'}}>
              You don't have any pals yet, also please make sure you are
              connected to the internet
            </Text>
          </Layout>
        )}
        <Modal
          useNativeDriver
          backButtonClose
          backdropPressToClose={false}
          style={styles.modal}
          position="center"
          isOpen={modalOpen}
          key={modalOpen ? 1 : 2}>
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
            Send pal request
          </Text>
          <Layout
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.usernameInput}
              autoCapitalize="none"
              placeholder="Enter username"
              value={username}
              onChangeText={(u) => this.setState({username: u})}
            />
          </Layout>
          <Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginBottom: 10,
            }}>
            <Button
              onPress={() => this.setState({modalOpen: false})}
              status="danger">
              Cancel
            </Button>
            <Button onPress={() => this.sendRequest(username)}>Submit</Button>
          </Layout>
        </Modal>
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  getFriends: (uid: string, limit?: number, startAt?: string) =>
    dispatch(fetchFriends(uid, limit, startAt)),
  onRequest: (friendUid) => dispatch(sendRequest(friendUid)),
  onAccept: (uid, friendUid) => dispatch(acceptRequest(uid, friendUid)),
  onRemove: (uid) => dispatch(deleteFriend(uid)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
