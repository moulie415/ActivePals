import React, { Component } from "react"
import { 
  Alert,
  Platform,
  TouchableOpacity
} from "react-native"
import {
  Header,
  Container,
  Title,
  Left,
  Right,
  Icon
} from 'native-base'
import firebase from "Anyone/index"
import { GiftedChat } from 'react-native-gifted-chat'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import colors from 'Anyone/constants/colors'

export default class Messaging extends React.Component {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.session = this.params.session
    this.uid = this.params.uid

    if (this.session) {
      this.sessionId = this.params.sessionId
    }
    else {
      this.chatId = this.params.chatId
      this.friendUsername = this.params.friendUsername
      this.friendUid = this.params.friendUid
    }
    this.state = {
      messageObjects: [],
      messages: [],
      user: {}
    }
  }


  componentDidMount() {
    let ref 
    if (this.session) {
      ref = firebase.database().ref('sessions/'+ this.sessionId).child('chat').orderByKey().limitToLast(30) 
    }
    else {
      ref = firebase.database().ref('chats/'+ this.chatId).orderByKey().limitToLast(30)
    }
    this.fetchMessages(ref)
    firebase.database().ref('users/' + this.uid).once('value', snapshot => {
      this.setState({user: snapshot.val()})
    })
    if (!this.session) {
      firebase.database().ref('users/' + this.friendUid).child('FCMToken').once('value', snapshot => {
        this.friendToken = snapshot.val()
      })
    }

    FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'));

    this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
      if (notif.type == 'message' || notif.type == 'sessionMessage') {
        try {
          let message
          const { createdAt, uid, username, _id, body, title, sessionId, aps} = notif
          if (notif.custom_notification) {
            let custom = JSON.parse(notif.custom_notification) 
            message = {createdAt, _id, text: custom.body, user: {_id: uid, name: username}}
          }
          else {
            message = {createdAt, _id, text: body, user: {_id: uid, name: username}}
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
      }
      })
      messageObjects = messageObjects.reverse()
        this.setState({messageObjects})
      //this.convertMessageObjects()

    })
  }



  // convertMessageObjects(){
  //   let messages = []
  //   this.state.messageObjects.forEach(item => {
  //     firebase.database().ref('users/' + item.user._id).once('value', snapshot => {

  //       let message = {
  //         ...item,
  //         user: {
  //           _id: snapshot.val().uid,
  //           name: snapshot.val().username
  //         },
  //         createdAt: new Date(item.createdAt),
  //       }
  //       messages.push(message)
  //       this.setState({messages})
  //     })
  //   })
  // }

  onSend(messages = []) {
    //make messages database friendly
    let converted = []
    messages.forEach(message => {
      if (this.session) {
        converted.push({...message, createdAt: message.createdAt.toString(), sessionId: this.sessionId, sessionTitle: this.session.title})
      }
      else {
        converted.push({...message, createdAt: message.createdAt.toString(), FCMToken: this.friendToken})
      }
    })

    let ref = this.session? firebase.database().ref('sessions/' + this.sessionId).child('chat') :
    firebase.database().ref('chats/' + this.chatId)

    ref.push(...converted)
    .then(() => {
      this.setState(previousState => ({
        messageObjects: GiftedChat.append(previousState.messageObjects, messages),
      }))

    })
    .catch(e => Alert.alert("Error sending message", e.message))

  }

  render() {
    const { navigation } = this.props
    return (
      <Container>
      <Header style={{backgroundColor: colors.primary}}>  
        <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => navigation.goBack() }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff' }}>{this.friendUsername || this.session.title}</Title>
        <Right style={{flex: 1}}/>
      </Header>
        <GiftedChat
          messages={this.state.messageObjects}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.uid,
            name: this.state.user.username
          }}
        />
      </Container>
    )
  }
  componentWillUnmount() {
        // stop listening for events
        this.notificationListener.remove();
    }
}