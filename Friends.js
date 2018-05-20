import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Image
} from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Title,
  Right,
  Left
} from 'native-base'
import firebase from "./index"
import colors from './constants/colors'
import Modal from 'react-native-modalbox'
import styles from './styles/friendsStyles'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import sStyles from 'Anyone/styles/sessionStyles'


 class Friends extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Buddies',
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
      refreshing: false
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
      } else {
      }
    })
    let friendsRef = firebase.database().ref('users/' + this.uid + '/friends')
    this.listenForFriends(friendsRef)
    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'))

  }

  listenForFriends(ref) {
    ref.on('child_added', snapshot => {
        this.props.add(snapshot)
    })
    ref.on('child_changed', snapshot => {
        this.props.add(snapshot)
    })
    ref.on('child_removed', snapshot => {
        this.props.removeLocal(snapshot.key)
    })
  }


  _onRefresh() {
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
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}>
          </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff', fontFamily: 'Avenir'}}>Buddies</Title>
        <Right style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
        firebase.database().ref('users/' + this.uid).child('username')
          .once('value', snapshot => {
            snapshot.val()? this.refs.modal.open() : Alert.alert("Please set a username before trying to add a buddy")
          })
          }}>
            <Icon name='md-add' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
        </Right>
      </Header>
      <Content contentContainerStyle={{flex: 1}}
      refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }>
      {this.state.friends.length > 0 ?
      <ScrollView>
      {this.renderFriends()}
      </ScrollView> :
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You don't have any buddies yet, also please make sure you are connected to the internet
          </Text></View>}

      <Modal style={styles.modal} position={"center"} ref={"modal"} >
          <Text style={styles.modalText}>Send buddy request</Text>
          <TextInput 
          underlineColorAndroid='transparent'
          style={styles.usernameInput}
          autoCapitalize={'none'}
          placeholder={'Enter username'}
          onChangeText={username => this.username = username}
          />
          <TouchableOpacity onPress={()=> this.sendRequest(this.username)}
          style={{padding: 10, backgroundColor: colors.primary, marginTop: 10}}>
            <Text style={{fontFamily: "Avenir", color: '#fff'}}>Submit</Text>
          </TouchableOpacity>
        </Modal>

        <Modal style={[sStyles.modal, {backgroundColor: colors.primary}]} position={"center"} ref={"profileModal"} isDisabled={this.state.isDisabled}>
        {this.state.selectedUser && <View style={{margin: 10, flex: 1}}>

         <View style={{flexDirection: 'row'}}>       

         {this.state.selectedUser.avatar? <Image source={{uri: this.state.selectedUser.avatar}} 
         style={{height: 90, width: 90, marginRight: 10, borderRadius: 5}} /> : null}
         <View style={{flex: 1}}>
          <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            <Text style={{fontFamily: 'Avenir', fontWeight: 'bold', color: '#fff'}}>{this.state.selectedUser.username}</Text>
          </View>
          {(this.state.selectedUser.first_name || this.state.selectedUser.last_name) && 
            <View style={{flexDirection: 'row', backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            {this.state.selectedUser.first_name && <Text style={{fontFamily: 'Avenir', color: '#fff'}}>
            {this.state.selectedUser.first_name + ' '}</Text>}
            {this.state.selectedUser.last_name && <Text style={{fontFamily: 'Avenir', color: '#fff'}}>
            {this.state.selectedUser.last_name}</Text>}
          </View>}
          </View>

          </View>

          {this.state.selectedUser.birthday && <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
            <Text style={{fontFamily: 'Avenir', color: '#fff'}}>{'Birthday: ' + this.state.selectedUser.birthday}</Text></View>}

          <View style={{backgroundColor: '#fff7', padding: 10, marginBottom: 10, borderRadius: 5}}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>{"Account type: " + 
          this.state.selectedUser.accountType}</Text></View>

            </View>}
          <TouchableOpacity 
          style={{backgroundColor: 'red', padding: 10, alignSelf: 'center', marginBottom: 10}}
          onPress={()=> {
            Alert.alert(
              "Delete friend",
              "Are you sure?",
              [
              {text: "Cancel", style: 'cancel'},
              {text: "Yes", onPress: ()=> this.remove(this.state.selectedUser.uid), style: 'destructive'}
              ]
              )
          }}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>Delete friend</Text>
          </TouchableOpacity>

        </Modal>
        </Content>
    </Container>
  )
  }


  renderFriends() {
    let list = []
    let index = 1
    this.state.friends.forEach(friend => {
        if (friend.status == 'outgoing') {
        list.push(
          <View key={index}
          style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
            <View style={{flexDirection: 'row', height: 40, alignItems: 'center'}} >
              <Text style={{marginHorizontal: 10}}>{friend.username + ' request sent'}</Text>
            </View>
          </View>
          )
      }
      else if (friend.status == 'incoming') {
        list.push(
          <View key={index}
          style={{paddingVertical: 20, paddingHorizontal: 15, backgroundColor: '#fff'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent: 'space-between'}} >
              <Text style={{marginRight: 5, flex: 4}}>{friend.username + ' has sent you a buddy request'}</Text>
              <View style={{flexDirection: 'row', flex: 1}}>
                <TouchableOpacity onPress={()=> this.accept(friend.uid)}>
                 <Icon name='ios-checkmark' style={{color: 'green', fontSize: 50, padding: 10}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=> this.remove(friend.uid)}>
                  <Icon name='ios-close' style={{color: 'red', fontSize: 50, padding: 10}}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )
      }
      else if (friend.status == 'connected') {
        list.push(
          <View key={index}
          style={{backgroundColor: '#fff', marginBottom: 1, paddingVertical: 15, paddingHorizontal: 10}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {friend.avatar? <Image source={{uri: friend.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
                <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
              <TouchableOpacity 
                onPress={()=> this.openChat(friend.uid, friend.username)}
                style={{padding: 5, marginHorizontal: 5}}>
                <Icon name='md-chatboxes' style={{color: colors.primary, fontSize: 30}}/>
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={()=> this.setState({selectedUser: friend}, ()=> this.refs.profileModal.open())}
              style={{padding: 5, marginHorizontal: 5}}>
                <Icon name='md-person' style={{color: colors.primary, fontSize: 30}}/>
              </TouchableOpacity>
              </View>
            </View>
          </View>
          )
      }
      index++
    })
    return list
  }

  accept(friend) {
    this.props.onAccept(this.uid, friend)
    .catch(e => Alert.alert("Error", e.message))

  }

  remove(friend) {
    this.props.onRemove(this.uid, friend, this.props.profile)
    .then(()=> this.refs.profileModal.close())
    .catch(e => Alert.alert("Error", e.message))

  }

  sendRequest(username) {
    if (username != this.props.profile.username) {
      firebase.database().ref('usernames/' + username).once('value').then(snapshot => {
        this.props.onRequest(this.uid, snapshot.val()).then(() => {
          Alert.alert("Success", "Request sent")
        })
        .catch(e => Alert.alert("Error", e.message))
      })
      .catch(e => Alert.alert("Error", e.message))
    }
    else {
      Alert.alert("Error", "You cannot add yourself as a friend")
    }
  }

  openChat(uid, username) {
    firebase.database().ref('users/' + this.uid + '/chats').child(uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          this.props.onOpenChat(snapshot.val(), username, uid)
        }
        else {
          Alert.alert(
            'Start a new chat with ' + username + '?',
            'This will be the beginning of your chat with ' + username,
            [
            {text: 'Cancel', style: 'cancel'},
            {text: 'OK', onPress: () => {
              let systemMessage = {
                _id: 1,
                text: 'Beginning of chat',
                createdAt: new Date().toString(),
                system: true,
              }
              firebase.database().ref('chats').push().then(newChat => {
                firebase.database().ref('chats/' + newChat.key).push(systemMessage)
                firebase.database().ref('users/' + this.uid + '/chats').child(uid).set(newChat.key)
                firebase.database().ref('users/' + uid + '/chats').child(this.uid).set(newChat.key)
                this.props.onOpenChat(newChat.key, username, uid)
              })

            }
              , style: 'positive'},
            ]
            )
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }
}

import { connect } from 'react-redux'
import { navigateMessaging } from 'Anyone/actions/navigation'
import { fetchFriends, sendRequest, acceptRequest, deleteFriend, removeFriend, addFriend } from 'Anyone/actions/friends'
import { removeChat } from 'Anyone/actions/chats'
import { fetchProfile } from 'Anyone/actions/profile'

const mapStateToProps = ({ friends, profile }) => ({
  friends: friends.friends,
  profile: profile.profile,
})

const mapDispatchToProps = dispatch => ({
  getFriends: (uids)=> { return dispatch(fetchFriends(uids))},
  onRequest: (uid, friendUid)=> {return dispatch(sendRequest(uid, friendUid))},
  onAccept: (uid, friendUid)=> {return dispatch(acceptRequest(uid, friendUid))},
  onRemove: (uid, friendUid, profile)=> {return dispatch(deleteFriend(uid, friendUid, profile))},
  removeLocal: (uid) => dispatch(removeFriend(uid)),
  getProfile: ()=> {return dispatch(fetchProfile())},
  onOpenChat: (chatId, friendUsername, friendUid) => dispatch(navigateMessaging(chatId, friendUsername, friendUid)),
  add: (friend) => dispatch(addFriend(friend))
})

export default connect(mapStateToProps, mapDispatchToProps)(Friends)
