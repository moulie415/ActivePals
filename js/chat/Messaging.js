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
import firebase from 'react-native-firebase'
import { GiftedChat, Bubble, MessageText, Avatar } from 'react-native-gifted-chat'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import colors from 'Anyone/js/constants/colors'
import Modal from 'react-native-modalbox'
import sStyles from 'Anyone/js/styles/sessionStyles'

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
        let type = this.session.private ? 'privateSessions' : 'sessions'
        converted.push({...message, createdAt: message.createdAt.toString(), sessionTitle: this.sessionTitle, sessionId: this.sessionId, type})
      }
      else {
        converted.push({...message, createdAt: message.createdAt.toString(), chatId: this.chatId, FCMToken: this.friendToken})
      }
    })

    let ref = this.session ? firebase.database().ref('sessionChats').child(this.sessionId) :
    firebase.database().ref('chats').child(this.chatId)

    ref.push(...converted)
    .then(() => {
      this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
      }))
      this.session ? this.props.getSessionChats(this.props.profile.sessions, this.sessionId) :
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
          onSend={messages => {
            if (this.props.profile.username) {
              this.onSend(messages)
            }
            else {
              Alert.alert(
                'Username not set',
                'You need a username before sending messages, go to your profile now?',
                [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'OK', onPress: () => this.props.navigateProfile()},
                ]
                )
            }
          }}
          onPressAvatar={user => this.props.viewProfile(user._id)}
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
        {this.state.spinner && <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center'}}>
          <Spinner color={colors.secondary}/>
        </View>}
      </Container>
    )
  }


  openChat(user) {
    firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
              this.props.onOpenChat(snapshot.val(), user.username, user.uid)
        }
      })
      .catch(e => Alert.alert('Error', e.message))
  }

  // componentWillUnmount() {

  //   }
}

import { connect } from 'react-redux'
import { navigateMessaging, navigateProfile, navigateProfileView } from 'Anyone/js/actions/navigation'
import { sendRequest, acceptRequest } from 'Anyone/js/actions/friends'
import { fetchChats, fetchSessionChats, fetchMessages, fetchSessionMessages, resetNotification } from 'Anyone/js/actions/chats'

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
  resetNotif: () => dispatch(resetNotification()),
  navigateProfile: () => dispatch(navigateProfile()),
  viewProfile: (uid) => dispatch(navigateProfileView(uid))

})

export default connect(mapStateToProps, mapDispatchToProps)(Messaging)
