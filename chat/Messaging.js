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
  Spinner,
} from 'native-base'
import firebase from "Anyone/index"
import { GiftedChat, Bubble, MessageText, Avatar } from 'react-native-gifted-chat'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import colors from 'Anyone/constants/colors'
import Modal from 'react-native-modalbox'
import sStyles from 'Anyone/styles/sessionStyles'

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
      this.sessionId = this.session.key
      this.sessionTitle = this.session.title
    }
    else {
      this.chatId = this.params.chatId
      this.friendUsername = this.params.friendUsername
      this.friendUid = this.params.friendUid
    }
    this.state = {
      messages: this.props.messageSession,
      user: {},
      avatar: '',
      spinner: false,
      amount: 30,
      showLoadEarlier: true
    }
  }


  componentDidMount() {
    this.loadMessages()

    if (!this.session) {
      firebase.database().ref('users/' + this.friendUid).child('FCMToken').once('value', snapshot => {
        this.friendToken = snapshot.val()
      })
    }

    this.props.profile.avatar ? this.setState({avatar: this.props.profile.avatar}) : this.setState({avatar: ''})

    FCM.getFCMToken().then(token => {
      firebase.database().ref('users/' + this.uid).child('FCMToken').set(token)
    })

    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'))

    FCM.getInitialNotification().then(notif => {
     console.log(notif)
   })
  }

  loadMessages() {
    this.setState({spinner: true})
    if (this.session) {
      this.props.getSessionMessages(this.sessionId, this.state.amount, this.session.private)
    }
    else {
      this.props.getMessages(this.chatId, this.state.amount, this.friendUid)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.messageSession && !this.fetched) {
      this.fetched = true
      this.setState({messages: nextProps.messageSession.reverse(), spinner: false})
      if (nextProps.messageSession.some(message => message._id == 1)) {
        this.setState({showLoadEarlier: false})
      }
    }
    if (nextProps.notif) {
      this.props.resetNotif()
      //ignore inital fetch when component mounts
      if (this.listenForNotif) {
        const { type, uid, username, _id, body, title, sessionId, sessionTitle, avatar, createdAt, custom_notification } = nextProps.notif
        if (type == 'message' || type == 'sessionMessage') {
          let message
          let date = new Date(createdAt)
          if (custom_notification) {
            let custom = JSON.parse(custom_notification) 
            message = {createdAt: date, _id, text: custom.body, user: {_id: uid, name: username, avatar}}
          }
          else {
            message = {createdAt: date, _id, text: body, user: {_id: uid, name: username, avatar}}
          }
          if ((type == 'message' && this.friendUid == uid) ||
            (type == 'sessionMessage' && this.sessionId == sessionId && this.uid != uid)) {
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
            }))
        }
      }
    }
  }
  this.listenForNotif = true
}


  // isFriend(uid) {
  //   let isFriend = false
  //   this.props.friends.forEach(friend => {
  //     if (friend.uid = uid) {
  //       isFriend = friend
  //     }
  //   })
  //   return friend

  // }

  onSend(messages = []) {
    //make messages database friendly
    let converted = []
    messages.forEach(message => {
      if (this.session) {
        let type = this.session.private ? "privateSessions" : 'sessions'
        converted.push({...message, createdAt: message.createdAt.toString(), sessionTitle: this.sessionTitle, sessionId: this.sessionId, type})
      }
      else {
        converted.push({...message, createdAt: message.createdAt.toString(), chatId: this.chatId, FCMToken: this.friendToken})
      }
    })

    let ref = this.session ? firebase.database().ref('sessionChats/' + this.sessionId) :
    firebase.database().ref('chats/' + this.chatId)

    ref.push(...converted)
    .then(() => {
      this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
      }))
      this.session? this.props.getSessionChats(this.props.profile.sessions, this.sessionId) : 
      this.props.getChats(this.props.profile.chats)
    })
    .catch(e => Alert.alert("Error sending message", e.message))

  }

  render() {
    const { navigation } = this.props
    return (
      <Container style={{flex: 1, backgroundColor: '#9993'}}>
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
            navigation.goBack()
          } }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Text numberOfLines={1}
        style={{alignSelf: 'center', flex: 1, color: '#fff', textAlign: 'center', fontFamily: 'Avenir'}}>
        {this.friendUsername || this.sessionTitle}</Text>
        <Right style={{flex: 1}}/>
      </Header>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          onPressAvatar={user => this.fetchUser(user)}
          onLoadEarlier={()=> {
            this.fetched = false
            this.setState({amount: this.state.amount += 15, spinner: true} ,()=> this.loadMessages())
          }}
          loadEarlier={this.state.messages && this.state.messages.length > 29 && this.state.showLoadEarlier}
          user={{
            _id: this.uid,
            name: this.props.profile.username,
            avatar: this.state.avatar
          }}
          renderBubble={(props) => { return ( 
            <Bubble {...props} 
            wrapperStyle={{
              right: {
                backgroundColor: colors.secondary
              }
            }}/>
            )}}
          renderMessageText={(props)=> { return (
            <View>
              {((props.previousMessage.user && props.position == 'left' && props.previousMessage.user._id != props.currentMessage.user._id) ||
              (!props.previousMessage.user && props.currentMessage.user && props.position == 'left')) &&
              <Text style={{color: colors.secondary, fontSize: 12, fontFamily: 'Avenir', padding: 10, paddingBottom: 0}}>
              {props.currentMessage.user.name}</Text>}
              <MessageText {...props} />
            </View>
            )}}
          />
        <Modal style={[sStyles.modal, {backgroundColor: colors.primary}]} position={"center"} ref={"modal"} isDisabled={this.state.isDisabled}>
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
        {this.state.spinner && <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
          <Spinner color={colors.secondary}/>
        </View>}
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
            'This will be the beginning of your chat with ' + user.username,
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
                firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).set(newChat.key)
                firebase.database().ref('users/' + user.uid + '/chats').child(this.uid).set(newChat.key)
                this.props.onOpenChat(newChat.key, user.username, user.uid)
              })


            }
            , style: 'positive'},
            ]
            )
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }

  // componentWillUnmount() {

  //   }
}

import { connect } from 'react-redux'
import { navigateMessaging } from 'Anyone/actions/navigation'
import { fetchFriends, sendRequest, acceptRequest, deleteFriend } from 'Anyone/actions/friends'
import { fetchChats, fetchSessionChats, fetchMessages, fetchSessionMessages, addMessage, resetNotification } from 'Anyone/actions/chats'

const fetchId = (params) => {
  if (params.session) {
    return params.session.key
  }
  else return params.chatId
}

const mapStateToProps = ({ friends, profile, chats }, ownProps) => ({
  friends: friends.friends,
  profile: profile.profile,
  sessionChats: chats.sessionChats,
  chats: chats.chats,
  messageSession: chats.messageSessions[fetchId(ownProps.navigation.state.params)],
  notif: chats.notif,
})

const mapDispatchToProps = dispatch => ({
  getChats: (chats) => {return dispatch(fetchChats(chats))},
  getSessionChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onRequest: (uid, friendUid)=> {return dispatch(sendRequest(uid, friendUid))},
  onAccept: (uid, friendUid)=> {return dispatch(acceptRequest(uid, friendUid))},
  onOpenChat: (chatId, friendUsername, friendUid)=> {return dispatch(navigateMessaging(chatId, friendUsername, friendUid))},
  getMessages: (id, amount, uid) => dispatch(fetchMessages(id, amount, uid)),
  getSessionMessages: (id, amount, isPrivate) => dispatch(fetchSessionMessages(id, amount, isPrivate)),
  resetNotif: () => dispatch(resetNotification())

})

export default connect(mapStateToProps, mapDispatchToProps)(Messaging)
