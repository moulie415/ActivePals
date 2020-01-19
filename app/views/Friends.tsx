import React, { Component } from 'react';
import { Alert, View, TextInput, Platform, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase from 'react-native-firebase';
import Image from 'react-native-fast-image';
import Modal from 'react-native-modalbox';
import { connect } from 'react-redux';
import colors from '../constants/colors';
import styles from '../styles/friendsStyles';
import { getStateColor, sortByState } from '../constants/utils';
import Header from '../components/Header/header';
import Text from '../components/Text';
import Button from '../components/Button';
import { navigateMessaging, navigateProfileView } from '../actions/navigation';
import {
  fetchFriends,
  sendRequest,
  acceptRequest,
  deleteFriend,
  removeFriend,
  addFriend,
  updateFriendState,
} from '../actions/friends';
import { removeChat, addChat } from '../actions/chats';

class Friends extends Component {
  constructor(props) {
    super(props);
    this.nav = this.props.navigation
    this.uid = this.props.profile.uid
    this.user = null
    this.state = {
      friends: Object.values(this.props.friends),
      refreshing: false,
    };
  }

  static navigationOptions = {
    header: null,
    tabBarLabel: 'Pals',
    tabBarIcon: ({ tintColor }) => <Icon name="md-people" size={25} style={{ color: tintColor }} />,
  };

  async refresh() {
    if (this.props.profile.friends) {
      this.setState({ refreshing: true });
      await this.props.getFriends(this.props.profile.friends);
      this.setState({refreshing: false});
    }
  }

  renderFriends() {
    return (
      <FlatList
        style={{ backgroundColor: colors.bgColor }}
        data={sortByState(Object.values(this.props.friends))}
        keyExtractor={friend => friend.uid}
        onRefresh={()=> this.refresh()}
        refreshing={this.state.refreshing}
        renderItem={({ item }) => {
          if (item.status === 'outgoing') {
            return (
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
                <View style={{flexDirection: 'row', height: 40, alignItems: 'center', justifyContent: 'center'}} >
                  <Text style={{marginHorizontal: 10, flex: 1}}>{item.username + ' request sent'}</Text>
                  <TouchableOpacity
                    style={{ marginTop: Platform.OS == 'ios' ? -5 : 0 }}
                    onPress={() => {
                      Alert.alert(
                        'Cancel Pal request',
                        'Are you sure?',
                        [
                          {text: 'Cancel', style: 'cancel'},
                          {text: 'OK', onPress: () => this.remove(item.uid)},
                        ],
                      )
                    }}>
                    <Icon name='ios-close' size={50} style={{color: 'red', paddingHorizontal: 10}}/>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          if (item.status === 'incoming') {
            return (
              <View style={{paddingVertical: 20, paddingHorizontal: 15, backgroundColor: '#fff'}}>
                <View style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent: 'space-between'}} >
                  <Text style={{marginRight: 5, flex: 4}}>{item.username + ' has sent you a pal request'}</Text>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <TouchableOpacity onPress={()=> this.props.onAccept(this.uid, item.uid)}>
                    <Icon size={50} name='ios-checkmark' style={{color: 'green', paddingHorizontal: 10, alignSelf: 'center'}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=> this.remove(item.uid)}>
                      <Icon size={50} name='ios-close' style={{color: 'red', paddingHorizontal: 10, alignSelf: 'center'}}/>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }
          if (item.status === 'connected') {
            return (
              <View style={{backgroundColor: '#fff', marginBottom: 1, paddingVertical: 15, paddingHorizontal: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center', height: 50, justifyContent: 'space-between'}} >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {item.avatar? <Image source={{uri: item.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                    <Icon size={65} name='md-contact'  style={{color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
                    <Text style={{marginHorizontal: 10}}>{item.username}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                  {item.state && <Text style={{color: getStateColor(item.state), alignSelf: 'center', marginRight: 10}}>{item.state}</Text>}
                  {item.state && <View style={{
                    width: 10,
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: getStateColor(item.state),
                    alignSelf: 'center'
                    }}/>}
                  <TouchableOpacity
                    onPress={()=> this.openChat(item.uid, item.username)}
                    style={{padding: 5, marginHorizontal: 5}}>
                    <Icon size={30} name='md-chatboxes' style={{color: colors.secondary}}/>
                  </TouchableOpacity>
                  <TouchableOpacity
                  onPress={()=> this.props.viewProfile(item.uid)}
                  style={{padding: 5, marginHorizontal: 5}}>
                    <Icon size={30} name='md-person' style={{color: colors.secondary}}/>
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
    return (
      <>
        <Header 
          title="Pals"
          right={<TouchableOpacity onPress={() => {
          firebase.database().ref('users/' + this.uid).child('username')
            .once('value', snapshot => {
              snapshot.val()? this.refs.modal.open() : Alert.alert("Please set a username before trying to add a pal")
            })
            }}>
              <Icon name='md-add' size={25} style={{color: '#fff', padding: 5}} />
            </TouchableOpacity>}
        />
        <ScrollView contentContainerStyle={{flex: 1}}>
        {Object.values(this.props.friends).length > 0 ?
        this.renderFriends() :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
              <Text style={{color: colors.primary, textAlign: 'center'}}>
              {"You don't have any pals yet, also please make sure you are connected to the internet"}
            </Text></View>}

        <Modal
          backButtonClose={true}
          backdropPressToClose={false}
          style={styles.modal}
          position={"center"}
          ref={"modal"}>
            <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
            Send pal request</Text>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <TextInput
              underlineColorAndroid='transparent'
              style={styles.usernameInput}
              autoCapitalize={'none'}
              placeholder={'Enter username'}
              onChangeText={username => this.username = username}
              />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 10}}>
            <Button onPress={()=> {
              this.refs.modal.close()
            }}
            text='Cancel'
            color='red'/>
        
            <Button onPress={()=> {
              this.sendRequest(this.username)
            }}
            text='Submit'/>
            
            </View>
          </Modal>
          </ScrollView>
      </>
    )
  }

  async remove(friend) {
    try {
      await this.props.onRemove(friend);
      this.refs.modal.close();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async sendRequest(username) {
    if (username !== this.props.profile.username) {
      try {
      const snapshot = await firebase.database().ref('usernames/' + username).once('value')
        if (snapshot.val()) {
          const status = await firebase.database().ref('userFriends/' + this.uid).child(snapshot.val()).once('value')
          if (status.val()) {
            Alert.alert('Sorry', "You've already added this user as a pal");
          } else {
            await this.props.onRequest(snapshot.val());
            Alert.alert("Success", "Request sent")
            this.refs.modal.close()
          }
      } else Alert.alert('Sorry','Username does not exist')
     } catch(e) {
      Alert.alert("Error", e.message)
     }
    } else {
      Alert.alert("Error", "You cannot add yourself as a pal")
    }
  }

  async openChat(uid, username) {
    try {
      const snapshot = await firebase.database().ref('userChats/' + this.uid).child(uid).once('value')
      if (snapshot.val()) {
        this.props.onOpenChat(snapshot.val(), username, uid);
      } else {
        Alert.alert('Error', 'You should not be seeing this error message, please contact support');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }
}



const mapStateToProps = ({ friends, profile }) => ({
  friends: friends.friends,
  profile: profile.profile,
});

const mapDispatchToProps = dispatch => ({
  getFriends: uids => dispatch(fetchFriends(uids)),
  onRequest: friendUid => dispatch(sendRequest(friendUid)),
  onAccept: (uid, friendUid) => dispatch(acceptRequest(uid, friendUid)),
  onRemove: uid => dispatch(deleteFriend(uid)),
  removeLocal: uid => dispatch(removeFriend(uid)),
  viewProfile: uid => dispatch(navigateProfileView(uid)),
  onOpenChat: (chatId, friendUsername, friendUid) => dispatch(navigateMessaging(chatId, friendUsername, friendUid)),
  add: friend => dispatch(addFriend(friend)),
  addChat: chat => dispatch(addChat(chat)),
  removeChat: chat => dispatch(removeChat(chat)),
  updateFriendState: (uid, state) => dispatch(updateFriendState(uid, state)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
