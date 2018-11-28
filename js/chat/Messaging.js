import React, { Component } from "react"
import {
  Alert,
  Platform,
  TouchableOpacity,
  View,
} from "react-native"
import {
  Container,
  Title,
  Left,
  Right,
  Icon,
  Text,
  Spinner,
} from 'native-base'
import Image from 'react-native-fast-image'
import firebase from 'react-native-firebase'
import { GiftedChat, Bubble, MessageText, Avatar } from 'react-native-gifted-chat'
import colors from 'Anyone/js/constants/colors'
import sStyles from 'Anyone/js/styles/sessionStyles'
import Header from '../header/header'
import { isIphoneX } from 'react-native-iphone-x-helper'

class Messaging extends React.Component {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.session = this.params.session
    this.gymId = this.params.gymId
    this.uid = this.props.profile.uid
    this.nav = this.props.navigation


    if (this.session) {
      this.sessionId = this.session.key
      this.sessionTitle = this.session.title
    }
    else if (this.gymId) {
      this.gymName = this.props.gym.name
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

    if (!this.session && !this.gymId) {
      firebase.database().ref('users/' + this.friendUid).child('FCMToken').once('value', snapshot => {
        this.friendToken = snapshot.val()
      })
    }

    this.props.profile.avatar ? this.setState({avatar: this.props.profile.avatar}) : this.setState({avatar: ''})

  }

  loadMessages() {
    this.setState({spinner: true})
    if (this.session) {
      this.props.getSessionMessages(this.sessionId, this.state.amount, this.session.private)
    }
    else if (this.gymId) {
      this.props.getGymMessages(this.gymId, this.state.amount)
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
        const { 
          type,
          uid,
          username,
          _id,
          body,
          sessionId,
          avatar,
          createdAt,
          custom_notification,
          gymId,
         } = nextProps.notif
        if (type == 'message' || type == 'sessionMessage' || type == 'gymMessage') {
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
            (type == 'sessionMessage' && this.sessionId == sessionId && this.uid != uid) ||
            (type == 'gymMessage' && this.gymId == gymId && this.uid != uid)) {
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
            }))
        }
      }
    }
  }
  this.listenForNotif = true
}

  onSend(messages = []) {
    //make messages database friendly
    let converted = []
    messages.forEach(message => {
      if (this.session) {
        let type = this.session.private ? 'privateSessions' : 'sessions'
        converted.push({...message, createdAt: message.createdAt.toString(), sessionTitle: this.sessionTitle, sessionId: this.sessionId, type})
      }
      else if (this.gymId) {
        converted.push({...message, createdAt: message.createdAt.toString(), gymId: this.gymId, gymName: this.gymName})
      }
      else {
        converted.push({...message, createdAt: message.createdAt.toString(), chatId: this.chatId, FCMToken: this.friendToken, friendUid: this.friendUid})
      }
    })

    let ref = this.session ? firebase.database().ref('sessionChats').child(this.sessionId) :
    firebase.database().ref('chats').child(this.chatId)

    if (this.gymId) {
      ref = firebase.database().ref('gymChats').child(this.gymId)
    }

    ref.push(...converted)
    .then(() => {
      this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
      }))


      if (this.session) {
        this.props.getSessionChats(this.props.profile.sessions, this.sessionId)
      }
      else if (this.gymId) {
        this.props.getGymChat(this.gymId)
      }
      else {
        this.props.getChats(this.props.profile.chats)
      }
      
    })
    .catch(e => Alert.alert("Error sending message", e.message))

  }

  getRightHandIcon() {
    if (this.gymId) {
      return <TouchableOpacity onPress={()=> this.props.goToGym(this.gymId)}>
        <Icon name='md-information-circle' style={{color: '#fff'}}/>
      </TouchableOpacity>
    }
    else return null
  }

  render() {
    const { navigation } = this.props
    return (
      <Container style={{flex: 1, backgroundColor: '#9993'}}>
      <Header 
      hasBack={true}
      title={this.friendUsername || this.sessionTitle || this.gymName}
      right={this.getRightHandIcon()}
       />
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
            renderActions={() => {
              return <TouchableOpacity 
              style={{marginLeft: isIphoneX() ? 10 : 0, padding: 5, paddingLeft: 10}}>
                <Icon name="ios-attach"/>
              </TouchableOpacity>
            }}
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
import { navigateMessaging, navigateProfile, navigateProfileView, navigateGym } from 'Anyone/js/actions/navigation'
import { sendRequest, acceptRequest } from 'Anyone/js/actions/friends'
import { fetchChats, fetchSessionChats, fetchMessages, fetchSessionMessages, fetchGymMessages, resetNotification } from 'Anyone/js/actions/chats'
import { fetchGymChat } from "../actions/chats";

const fetchId = (params) => {
  if (params.session) {
    return params.session.key
  }
  else if (params.gymId) {
    return params.gymId
  }
  else return params.chatId
}

const mapStateToProps = ({ friends, profile, chats }, ownProps) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  sessionChats: chats.sessionChats,
  chats: chats.chats,
  gymChat: chats.gymChat,
  messageSession: chats.messageSessions[fetchId(ownProps.navigation.state.params)],
  notif: chats.notif,
})

const mapDispatchToProps = dispatch => ({
  getChats: (chats) => {return dispatch(fetchChats(chats))},
  getSessionChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  getGymChat: (gym) => dispatch(fetchGymChat(gym)),
  onRequest: (uid, friendUid)=> {return dispatch(sendRequest(uid, friendUid))},
  onAccept: (uid, friendUid)=> {return dispatch(acceptRequest(uid, friendUid))},
  onOpenChat: (chatId, friendUsername, friendUid)=> {return dispatch(navigateMessaging(chatId, friendUsername, friendUid))},
  getMessages: (id, amount, uid) => dispatch(fetchMessages(id, amount, uid)),
  getSessionMessages: (id, amount, isPrivate) => dispatch(fetchSessionMessages(id, amount, isPrivate)),
  getGymMessages: (id, amount) => dispatch(fetchGymMessages(id, amount)),
  resetNotif: () => dispatch(resetNotification()),
  navigateProfile: () => dispatch(navigateProfile()),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  goToGym: (gym) => dispatch(navigateGym(gym))

})

export default connect(mapStateToProps, mapDispatchToProps)(Messaging)
