import React, { Component } from "react"
import { 
  Alert,
  Platform,
  TouchableOpacity,
  View,
} from "react-native"
import {
  Header,
  Container,
  Title,
  Left,
  Right,
  Icon,
  Text
} from 'native-base'
import firebase from "Anyone/index"
import { GiftedChat } from 'react-native-gifted-chat'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import colors from 'Anyone/constants/colors'
import Modal from 'react-native-modalbox'
import hStyles from 'Anyone/styles/homeStyles'
import { EventRegister } from 'react-native-event-listeners'

export default class Messaging extends React.Component {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.session = this.params.session
    this.uid = this.params.uid
    this.nav = this.props.navigation

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
      this.session? EventRegister.emit('newSessionMessage') : EventRegister.emit('newMessage')
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
          onPressAvatar={user => this.fetchUser(user)}
          user={{
            _id: this.uid,
            name: this.state.user.username
          }}
        />
        <Modal style={[hStyles.modal, {backgroundColor: colors.primary}]} position={"center"} ref={"modal"} isDisabled={this.state.isDisabled}>
        {this.state.selectedUser && <View style={{margin: 10, flex: 1}}>
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
        firebase.database().ref('users/' + this.uid + '/friends').child(user.uid).set("connected")
        .then(()=> {
          firebase.database().ref('users/' + user.uid + '/friends').child(this.uid).set("connected")
          .then(() => {
            this.refs.modal.close()
          })
        })
        .catch(e => Alert.alert("Error", e.message))
      }}
      style={{backgroundColor: colors.secondary, padding: 10, width: '40%'}}>
      <Text style={{color: '#fff', textAlign: 'center'}}>Accept friend request</Text>
      </TouchableOpacity>
    }
    else if (user.status == 'outgoing') {
      return <Text>Friend request sent</Text>
    } 
    else if (this.session) {
      return <TouchableOpacity
      onPress={()=> {
        firebase.database().ref('users/' + this.uid + '/friends').child(user.uid).set("outgoing")
        .then(()=> {
          firebase.database().ref('users/' + user.uid + '/friends').child(this.uid).set("incoming")
          .then(() => {
            this.refs.modal.close()
            Alert.alert("Success", "Request sent")
          })
        })
        .catch(e => Alert.alert("Error", e.message))
      }}
      style={{backgroundColor: colors.secondary, padding: 10, width: '40%'}}>
      <Text style={{color: '#fff', textAlign: 'center'}}>Send friend request</Text>
      </TouchableOpacity>
    }
    else return null

  }

  fetchUser(user) {
    firebase.database().ref('users/' + user._id).once('value', snapshot => {
      firebase.database().ref('users/' + this.uid + '/friends').child(user._id)
        .once('value', status => {
          this.setState({selectedUser: {...snapshot.val(), status: status.val()}}, ()=> this.refs.modal.open())
        })
    })
  }

  openChat(user) {
    firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          this.nav.navigate('Messaging', 
            {chatId: snapshot.val(), uid: this.uid, friendUid: user.uid, friendUsername: user.username})
        }
        else {
          Alert.alert(
            'Start a new chat with ' + user.username + '?',
            'This will be the beggining of your chat with ' + user.username,
            [
            {text: 'Cancel', style: 'cancel'},
            {text: 'OK', onPress: () => {
              let timestamp = (new Date()).toString()
              firebase.database().ref('chats').push({_id: 'initial'}).then(snapshot => {
                let chatId = snapshot.key
                firebase.database().ref('chats').child(chatId).push({_id: 'initial'}).then(snapshot => {
                firebase.database().ref('chats').child(chatId).child('_id').remove()
                firebase.database().ref('users/' + this.uid + '/chats').child(user.uid).set(chatId)
                firebase.database().ref('users/' + user.uid + '/chats').child(this.uid).set(chatId)
                this.nav.navigate('Messaging', 
                  {chatId, uid: this.uid, friendUid: user.uid, friendUsername: user.username})
                })
              })

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
        this.notificationListener.remove();
    }
}