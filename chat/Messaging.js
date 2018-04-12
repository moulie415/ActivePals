import React, { Component } from "react"
import { 
  Alert,
  Platform,
  TouchableOpacity,
  View,
  Image
} from "react-native"
import {
  Header,
  Container,
  Title,
  Left,
  Right,
  Icon,
  Text,
} from 'native-base'
import firebase from "Anyone/index"
import { GiftedChat } from 'react-native-gifted-chat'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import colors from 'Anyone/constants/colors'
import Modal from 'react-native-modalbox'
import hStyles from 'Anyone/styles/homeStyles'

class Messaging extends React.Component {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.session = this.params.session
    this.uid = this.props.profile.uid
    this.nav = this.props.navigation


    if (this.session) {
      this.sessionId = this.params.sessionId
      this.sessionTitle = this.params.sessionTitle
    }
    else {
      this.chatId = this.params.chatId
      this.friendUsername = this.params.friendUsername
      this.friendUid = this.params.friendUid
    }
    this.state = {
      messageObjects: [],
      messages: [],
      user: {},
      avatar: ''
    }
  }


  componentDidMount() {
    let ref 
    if (this.session) {
      ref = firebase.database().ref('sessionChats/'+ this.sessionId).orderByKey().limitToLast(30) 
    }
    else {
      ref = firebase.database().ref('chats/'+ this.chatId).orderByKey().limitToLast(30)
    }
    this.fetchMessages(ref)

    if (!this.session) {
      firebase.database().ref('users/' + this.friendUid).child('FCMToken').once('value', snapshot => {
        this.friendToken = snapshot.val()
      })
    }

    this.props.profile.avatar? this.setState({avatar: this.props.profile.avatar}) : this.setState({avatar: ''})

    FCM.getFCMToken().then(token => {
      firebase.database().ref('users/' + this.uid).child('FCMToken').set(token)
    })

    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'))

    this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
      if (notif.type == 'message' || notif.type == 'sessionMessage') {
        try {
          let message
          const { createdAt, uid, username, _id, body, title, sessionId, aps, avatar} = notif
          if (notif.custom_notification) {
            let custom = JSON.parse(notif.custom_notification) 
            message = {createdAt, _id, text: custom.body, user: {_id: uid, name: username, avatar}}
          }
          else {
            message = {createdAt, _id, text: body, user: {_id: uid, name: username, avatar}}
          }
          if ((notif.type == 'message' && this.friendUid == uid) ||
            (notif.type == 'sessionMessage' && this.sessionId == sessionId && this.uid != uid)) {
            this.setState(previousState => ({
              messageObjects: GiftedChat.append(previousState.messageObjects, message),
            }))
          }
        }
        catch(e) {
          Alert.alert(e)
        }
      }
    })
    FCM.getInitialNotification().then(notif => {
     console.log(notif)
   })
  }



  fetchMessages(ref) {
    ref.once('value', snapshot => {
      let messageObjects = []
      snapshot.forEach(child => {
        if (child.val()._id != 'initial') {
          messageObjects.push({...child.val()})
          //let friend = this.isFriend(child.val().user._id)
          //friend? messageObjects.push({...child.val(), avatar: friend.avatar}) : messageObjects.push({...child.val()})
      }
      })
      messageObjects = messageObjects.reverse()
        this.setState({messageObjects})
      //this.convertMessageObjects()

    })
  }

  isFriend(uid) {
    let isFriend = false
    this.props.friends.forEach(friend => {
      if (friend.uid = uid) {
        isFriend = friend
      }
    })
    return friend

  }

  onSend(messages = []) {
    //make messages database friendly
    let converted = []
    messages.forEach(message => {
      if (this.session) {
        converted.push({...message, createdAt: message.createdAt.toString(), sessionId: this.sessionId, sessionTitle: this.sessionTitle})
      }
      else {
        converted.push({...message, createdAt: message.createdAt.toString(), chatId: this.chatId, FCMToken: this.friendToken})
      }
    })

    let ref = this.session? firebase.database().ref('sessionChats/' + this.sessionId) :
    firebase.database().ref('chats/' + this.chatId)

    ref.push(...converted)
    .then(() => {
      this.setState(previousState => ({
        messageObjects: GiftedChat.append(previousState.messageObjects, messages),
      }))
      this.session? this.props.getSessionChats(this.props.profile.sessions, this.uid) : 
      this.props.getChats(this.props.profile.chats)
    })
    .catch(e => Alert.alert("Error sending message", e.message))

  }

  render() {
    const { navigation } = this.props
    return (
      <Container style={{flex: 1}}>
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => navigation.goBack() }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Text numberOfLines={1}
        style={{alignSelf: 'center', flex: 1, color: '#fff', textAlign: 'center', fontFamily: 'Avenir'}}>
        {this.friendUsername || this.sessionTitle}</Text>
        <Right style={{flex: 1}}/>
      </Header>
        <GiftedChat
          messages={this.state.messageObjects}
          onSend={messages => this.onSend(messages)}
          onPressAvatar={user => this.fetchUser(user)}
          user={{
            _id: this.uid,
            name: this.props.profile.username,
            avatar: this.state.avatar
          }}
        />
        <Modal style={[hStyles.modal, {backgroundColor: colors.primary}]} position={"center"} ref={"modal"} isDisabled={this.state.isDisabled}>
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

            <View style={{flex: 1, justifyContent: 'flex-end'}}>
            {this.fetchFriendButton(this.state.selectedUser)}
              </View>
            </View>}

        </Modal>
      </Container>
    )
  }

  fetchFriendButton(user) {
    if (user.status == 'connected' && this.session) {
      return <TouchableOpacity
      onPress={()=> {
        this.openChat(user)
        this.refs.modal.close()
      }}
      style={{backgroundColor: colors.secondary, padding: 10, width: '40%'}}>
      <Text style={{color: '#fff', textAlign: 'center'}}>Send direct message</Text>
      </TouchableOpacity>
    }
    else if (user.status == 'incoming') {
      return <TouchableOpacity
      onPress={()=> {
        this.props.onAccept(this.uid, user.uid)
        .then(()=> this.refs.modal.close())
        .catch(e => Alert.alert("Error", e.message))
      }}
      style={{backgroundColor: colors.secondary, padding: 10, width: '40%'}}>
      <Text style={{color: '#fff', textAlign: 'center'}}>Accept buddy request</Text>
      </TouchableOpacity>
    }
    else if (user.status == 'outgoing') {
      return <Text style={{color: '#fff', padding: 5}}>Friend request sent</Text>
    } 
    else if (this.session) {
      return <TouchableOpacity
      onPress={()=> {
        this.props.onRequest(this.uid, user.uid)
        .then(()=> {
          this.refs.modal.close()
          Alert.alert("Success", "Request sent")
        })
        .catch(e => Alert.alert("Error", e.message))
      }}
      style={{backgroundColor: colors.secondary, padding: 10, width: '40%'}}>
      <Text style={{color: '#fff', textAlign: 'center'}}>Send buddy request</Text>
      </TouchableOpacity>
    }
    else return null

  }

  fetchUser(user) {
    firebase.database().ref('users/' + user._id).once('value', snapshot => {
      firebase.database().ref('users/' + this.uid + '/friends').child(user._id)
        .once('value', status => {
          this.setState({selectedUser: {...snapshot.val(), status: status.val(), avatar: user.avatar}}, ()=> this.refs.modal.open())
        })
    })
  }

  openChat(user) {
    firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
              this.props.onOpenChat(snapshot.val(), user.username, user.uid)
        }
        else {
          Alert.alert(
            'Start a new chat with ' + user.username + '?',
            'This will be the beggining of your chat with ' + user.username,
            [
            {text: 'Cancel', style: 'cancel'},
            {text: 'OK', onPress: () => {
              let chatId = firebase.database().ref('chats').push().key
              firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).set(chatId)
              firebase.database().ref('users/' + user.uid + '/chats').child(this.uid).set(chatId)
              this.props.onOpenChat(chatId, user.username, user.uid)

            }
            , style: 'positive'},
            ]
            )
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }
  componentWillUnmount() {
        // stop listening for events
        this.notificationListener.remove()
    }
}

import { connect } from 'react-redux'
import { navigateMessaging } from 'Anyone/actions/navigation'
import { fetchFriends, sendRequest, acceptRequest, deleteFriend } from 'Anyone/actions/friends'
import { fetchChats, fetchSessionChats } from 'Anyone/actions/chats'

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  sessionChats: chats.sessionChats,
  chats: chats.chats
})

const mapDispatchToProps = dispatch => ({
  getChats: (chats) => {return dispatch(fetchChats(chats))},
  getSessionChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onRequest: (uid, friendUid)=> {return dispatch(sendRequest(uid, friendUid))},
  onAccept: (uid, friendUid)=> {return dispatch(acceptRequest(uid, friendUid))},
  onOpenChat: (chatId, friendUsername, friendUid)=> {return dispatch(navigateMessaging(chatId, friendUsername, friendUid))}

})

export default connect(mapStateToProps, mapDispatchToProps)(Messaging)
