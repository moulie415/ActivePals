import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  TextInput,
  ScrollView,
  RefreshControl,
  Image,
  Platform,
  FlatList
} from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Title,
  Right,
  Left
} from 'native-base'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import firebase from 'react-native-firebase'
import colors from './constants/colors'
import Modal from 'react-native-modalbox'
import styles from './styles/friendsStyles'
import sStyles from 'Anyone/js/styles/sessionStyles'
import { arraysEqual, getStateColor } from './constants/utils'
import Header from './header/header'


 class Friends extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Pals',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-people'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.nav = this.props.navigation
    this.uid = this.props.profile.uid
    this.user = null
    this.state = {
      friends: Object.values(this.props.friends),
      refreshing: false,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
      } else {
      }
    })
    let chatRef = firebase.database().ref('users/' + this.uid).child('chats')
    this.listenForFriends()
    this.listenForState(this.state.friends)

  }

  listenForFriends() {
    let ref = firebase.database().ref('users/' + this.uid + '/friends')
    ref.on('child_added', snapshot => {
      if (!this.props.friends[snapshot.key]) {
        this.props.add(snapshot)
      }
    })
    ref.on('child_changed', snapshot => {
      this.props.add(snapshot)
    })
    ref.on('child_removed', snapshot => {
        this.props.removeLocal(snapshot.key)
    })
  }

  listenForState(friends) {
    friends.forEach(friend => {
      firebase.database().ref('users/' + friend.uid).child('state').on('value', snapshot => {
        if (this.props.friends[friend.uid]) {
          if (snapshot.val() && snapshot.val() == 'away' && this.props.friends[friend.uid].state != 'away') {
              this.props.updateFriendState(friend.uid, 'away')
          }
          else if (snapshot.val() && this.props.friends[friend.uid].state != 'online') {
            this.props.updateFriendState(friend.uid, 'online')
          }
          else {
            if (!snapshot.val() && this.props.friends[friend.uid].state != 'offline') {
              this.props.updateFriendState(friend.uid, 'offline')
            }
          }
      }
      })
    })
  }

  sortByState(friends) {
    return friends.sort((a,b) => {
      let stateA = getStateVal(a.state)
      let stateB = getStateVal(b.state)
      return stateB - stateA
    })
  }



  onRefresh() {
    if (this.props.profile.friends) {
      this.setState({refreshing: true})
      this.props.getFriends(this.props.profile.friends)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.friends) {
      this.setState({refreshing: false, friends: Object.values(nextProps.friends)})
    }
  }


  render () {
    return (
    <Container>
      <Header 
        title={'Pals'}
        right={<TouchableOpacity onPress={() => {
        firebase.database().ref('users/' + this.uid).child('username')
          .once('value', snapshot => {
            snapshot.val()? this.refs.modal.open() : Alert.alert("Please set a username before trying to add a pal")
          })
          }}>
            <Icon name='md-add' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>}
      />
      <Content contentContainerStyle={{flex: 1}}>
      {this.state.friends.length > 0 ?
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
      ref={"modal"} >
          <Text style={styles.modalText}>Send pal request</Text>
          <TextInput
          underlineColorAndroid='transparent'
          style={styles.usernameInput}
          autoCapitalize={'none'}
          placeholder={'Enter username'}
          onChangeText={username => this.username = username}
          />
          <View style={{flexDirection: 'row', marginTop: 10}}>
          <TouchableOpacity onPress={()=> {
            this.refs.modal.close()
          }}
          style={{padding: 10, backgroundColor: 'red', marginHorizontal: 10}}>
            <Text style={{fontFamily: "Avenir", color: '#fff'}}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={(mutex)=> {
            mutex.lockFor(1000)
            this.sendRequest(this.username)
          }}
          style={{padding: 10, backgroundColor: colors.secondary, marginHorizontal: 10}}>
            <Text style={{fontFamily: "Avenir", color: '#fff'}}>Submit</Text>
          </TouchableOpacity>
          
          </View>
        </Modal>
        </Content>
    </Container>
  )
  }


  renderFriends() {
    return <FlatList 
      style={{backgroundColor: '#9993'}}
      data={this.sortByState(this.state.friends)}
      keyExtractor={(friend)=> friend.uid}
      onRefresh={()=> this.onRefresh()}
      refreshing={this.state.refreshing}
      renderItem={({item}) => {
        if (item.status == 'outgoing') {
        return <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row', height: 40, alignItems: 'center'}} >
              <Text style={{marginHorizontal: 10}}>{item.username + ' request sent'}</Text>
            </View>
          </View>
      }
      else if (item.status == 'incoming') {
        return <View style={{paddingVertical: 20, paddingHorizontal: 15, backgroundColor: '#fff'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent: 'space-between'}} >
              <Text style={{marginRight: 5, flex: 4}}>{item.username + ' has sent you a pal request'}</Text>
              <View style={{flexDirection: 'row', flex: 1}}>
                <TouchableOpacity onPress={()=> this.accept(item.uid)}>
                 <Icon name='ios-checkmark' style={{color: 'green', fontSize: 50, paddingHorizontal: 10, alignSelf: 'center'}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.remove(item.uid)}>
                  <Icon name='ios-close' style={{color: 'red', fontSize: 50, paddingHorizontal: 10, alignSelf: 'center'}}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      }
      else if (item.status == 'connected') {
        return <View style={{backgroundColor: '#fff', marginBottom: 1, paddingVertical: 15, paddingHorizontal: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 50, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item.avatar? <Image source={{uri: item.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                <Icon name='md-contact'  style={{fontSize: 65, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
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
                <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 30}}/>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={()=> this.props.viewProfile(item.uid)}
              style={{padding: 5, marginHorizontal: 5}}>
                <Icon name='md-person' style={{color: colors.secondary, fontSize: 30}}/>
              </TouchableOpacity>
              </View>
            </View>
          </View>
      }
      else return null
      }}
    />
  }

  accept(friend) {
    this.props.onAccept(this.uid, friend)
    .then(this.listenForFriends())
    .catch(e => Alert.alert("Error", e.message))

  }

  remove(friend) {
    this.props.onRemove(friend)
    .then(()=> this.refs.modal.close())
    .catch(e => Alert.alert("Error", e.message))

  }

  sendRequest(username) {
    if (username != this.props.profile.username) {
      firebase.database().ref('usernames/' + username).once('value').then(snapshot => {
        if (snapshot.val()) {
        firebase.database().ref('users/' + this.uid + '/friends').child(snapshot.val()).once('value', status => {
          if (status.val()) {
            Alert.alert('Sorry', "You've already added this user as a pal")
          }
          else {
            this.props.onRequest(this.uid , snapshot.val()).then(() => {
              Alert.alert("Success", "Request sent")
              this.refs.modal.close()
            })
            .catch(e => Alert.alert("Error", e.message))
          }
        })
      }
      else Alert.alert('Sorry','Username does not exist')
      })
      .catch(e => Alert.alert("Error", e.message))
    }
    else {
      Alert.alert("Error", "You cannot add yourself as a pal")
    }
  }

  openChat(uid, username) {
    firebase.database().ref('users/' + this.uid + '/chats').child(uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          this.props.onOpenChat(snapshot.val(), username, uid)
        }
        else {
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }
}

const getStateVal = (state) => {
  switch(state) {
    case 'online':
      return 3
    case 'away':
      return 2
    default :
      return 1
  }
}

import { connect } from 'react-redux'
import { navigateMessaging, navigateProfileView } from 'Anyone/js/actions/navigation'
import {
  fetchFriends,
  sendRequest,
  acceptRequest,
  deleteFriend,
  removeFriend,
  addFriend,
  updateFriendState,
} from 'Anyone/js/actions/friends'
import { removeChat, addChat } from 'Anyone/js/actions/chats'
import { fetchProfile } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ friends, profile }) => ({
  friends: friends.friends,
  profile: profile.profile,
})

const mapDispatchToProps = dispatch => ({
  getFriends: (uids)=> dispatch(fetchFriends(uids)),
  onRequest: (uid, friendUid)=> dispatch(sendRequest(uid, friendUid)),
  onAccept: (uid, friendUid)=> dispatch(acceptRequest(uid, friendUid)),
  onRemove: (uid)=> {return dispatch(deleteFriend(uid))},
  removeLocal: (uid) => dispatch(removeFriend(uid)),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  onOpenChat: (chatId, friendUsername, friendUid) => dispatch(navigateMessaging(chatId, friendUsername, friendUid)),
  add: (friend) => dispatch(addFriend(friend)),
  addChat: (chat) => dispatch(addChat(chat)),
  removeChat: (chat) => dispatch(removeChat(chat)),
  updateFriendState: (uid, state) => dispatch(updateFriendState(uid, state))
})

export default connect(mapStateToProps, mapDispatchToProps)(Friends)
