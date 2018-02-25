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
    this.chatId = this.params.chatId
    this.uid = this.params.uid
    this.friendUsername = this.params.friendUsername
    this.state = {
      messageObjects: [],
      messages: [],
      user: {}
    }
  }


  componentDidMount() {
    let ref = firebase.database().ref('chats/'+ this.chatId).child('messages').orderByKey().limitToLast(30)
    this.fetchMessages(ref)
    firebase.database().ref('users/' + this.uid).once('value', snapshot => {
      this.setState({user: snapshot.val()})
    })
    // iOS: show permission prompt for the first call. later just check permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions().then(()=>console.log('granted')).catch(()=>console.log('notification permission rejected'))
        
        FCM.getFCMToken().then(token => {
          console.log(token)
            // store fcm token in your server
          })
        
        this.notificationListener = FCM.on(FCMEvent.Notification, async (notif) => {
            // optional, do some component related stuff
          })
        
        // initial notification contains the notification that launchs the app. If user launchs app by clicking banner, the banner notification info will be here rather than through FCM.on event
        // sometimes Android kills activity when app goes to background, and when resume it broadcasts notification before JS is run. You can use FCM.getInitialNotification() to capture those missed events.
        // initial notification will be triggered all the time even when open app by icon so send some action identifier when you send notification
        FCM.getInitialNotification().then(notif => {
         console.log(notif)
       })
      }



  fetchMessages(ref) {
    ref.once('value', snapshot => {
      let messageObjects = []
      snapshot.forEach(child => {
        messageObjects.push({...child.val()})
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
      converted.push({...message, createdAt: message.createdAt.toString()})
    })

    firebase.database().ref('chats/' + this.chatId).child('messages').push(...converted)
    this.setState(previousState => ({
      messageObjects: GiftedChat.append(previousState.messageObjects, messages),
    }))
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
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff' }}>{this.friendUsername || "Messaging"}</Title>
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