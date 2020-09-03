import React, {Component} from 'react';
import {Alert, View, Platform, TouchableOpacity} from 'react-native';
import database from '@react-native-firebase/database';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import styles from '../styles/friendsStyles';
import {getStateColor, sortByState} from '../constants/utils';
import {
  fetchFriends,
  sendRequest,
  acceptRequest,
  deleteFriend,
  SetModal,
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
  Input,
  Modal,
  Card,
} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import globalStyles from '../styles/globalStyles';
import Avatar from '../components/Avatar/Avatar';

interface State {
  refreshing: boolean;
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
    const {onRemove, setModal} = this.props;
    try {
      await onRemove(friend);
      setModal(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async sendRequest(username: string) {
    const {profile, onRequest, setModal} = this.props;
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
            setModal(false);
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
                    <ThemedIcon name="close" size={40} status="danger" />
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
                  <>
                    <TouchableOpacity
                      onPress={() => onAccept(profile.uid, item.uid)}>
                      <ThemedIcon size={40} name="checkmark" status="success" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.remove(item.uid)}>
                      <ThemedIcon size={40} name="close" status="danger" />
                    </TouchableOpacity>
                  </>
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
                    <Avatar uri={item.avatar} size={50} />
                  ) : (
                    <ThemedIcon size={40} name="person" />
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
    const {profile, friends, modalOpen, setModal} = this.props;
    const {username} = this.state;

    return (
      <Layout style={{flex: 1}}>
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
          style={styles.modal}
          backdropStyle={globalStyles.backdrop}
          onBackdropPress={() => setModal(false)}
          visible={modalOpen}>
          <Card disabled>
            <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
              Send pal request
            </Text>
            <Input
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              placeholder="Enter username"
              value={username}
              onChangeText={(u) => this.setState({username: u})}
            />
            <Layout
              style={{
                flexDirection: 'row',
                marginTop: 10,
                justifyContent: 'space-evenly',
              }}>
              <Button
                style={{margin: 5}}
                onPress={() => setModal(false)}
                status="danger">
                Cancel
              </Button>
              <Button
                style={{margin: 5}}
                onPress={() => this.sendRequest(username)}>
                Submit
              </Button>
            </Layout>
          </Card>
        </Modal>
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
  modalOpen: friends.modalOpen,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  getFriends: (uid: string, limit?: number, startAt?: string) =>
    dispatch(fetchFriends(uid, limit, startAt)),
  onRequest: (friendUid: string) => dispatch(sendRequest(friendUid)),
  onAccept: (uid: string, friendUid: string) =>
    dispatch(acceptRequest(uid, friendUid)),
  onRemove: (uid: string) => dispatch(deleteFriend(uid)),
  setModal: (show: boolean) => dispatch(SetModal(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
