import React, { Component } from "react"
import {
  Alert,
  Platform,
  TouchableOpacity,
  View,
  BackHandler,
  Keyboard
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
import { guid } from '../constants/utils'
import ImagePicker from 'react-native-image-picker'
import ImageResizer from 'react-native-image-resizer'
import EmojiInput from 'react-native-emoji-input'
import { NavigationActions } from "react-navigation"

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
      amount: 15,
      showLoadEarlier: true,
    }
  }

  onBackPress() {
        if (this.state.showEmojiKeyboard) {
          this.setState({showEmojiKeyboard: false})
        }
        else {
          this.props.goBack()
        }
        return true
    }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => this.onBackPress())
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this))

    this.loadMessages()

    if (!this.session && !this.gymId) {
      firebase.database().ref('users/' + this.friendUid).child('FCMToken').once('value', snapshot => {
        this.friendToken = snapshot.val()
      })
    }

    this.props.profile.avatar ? this.setState({avatar: this.props.profile.avatar}) : this.setState({avatar: ''})

  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () => this.onBackPress())
    this.keyboardDidShowListener.remove()
  }

  keyboardDidShow() {
    if (Platform.OS == 'ios') {
      this.setState({showEmojiKeyboard: false})
    }
  
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
    if (nextProps.message) {
      let message = {
        _id: guid(),
        createdAt: new Date(),
        text: nextProps.message.text,
        image: nextProps.message.url,
        user: {
          _id: this.uid,
          name: this.props.profile.username,
          avatar: this.state.avatar
        }
      }
      this.onSend([message])
      this.props.resetMessage()
    }
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
          image
         } = nextProps.notif
        if (type == 'message' || type == 'sessionMessage' || type == 'gymMessage') {
          let message
          let date = new Date(createdAt)
          if (custom_notification) {
            let custom = JSON.parse(custom_notification)
            message = {createdAt: date, _id, text: custom.body, user: {_id: uid, name: username, avatar}, image}
          }
          else {
            message = {createdAt: date, _id, text: body, user: {_id: uid, name: username, avatar}, image}
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
          ref={ref => this.chat = ref}
          text={this.state.text}
          onInputTextChanged={text => this.setState({text})}
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
              return <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
              onPress={()=> this.showPicker()}
              style={{marginLeft: isIphoneX() ? 10 : 0, padding: 5, paddingLeft: 15, paddingRight: 10}}>
                <Icon name="ios-attach" style={{color: colors.secondary}}/>
              </TouchableOpacity>
              <TouchableOpacity 
              style={{padding: 5}}
              onPress={() => {
                this.setState({showEmojiKeyboard: !this.state.showEmojiKeyboard})
                Keyboard.dismiss()
                }}>
                <Icon name="md-happy" style={{color: colors.secondary, marginTop: Platform.OS == 'ios' ? 0 : -1}}/>
              </TouchableOpacity>
              </View>
            }}
          />
          {this.state.showEmojiKeyboard &&  <EmojiInput
            enableSearch={Platform.OS == 'android'}
	              onEmojiSelected={(emoji) => {
                    this.setState({text: this.state.text += emoji.char})
                  }}
	            />}
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

  showPicker() {
    let videoOptions = {
      mediaType: 'video',
      durationLimit: 30,
    }
    let options = {
      title: null,
      mediaType: 'photo',
      // customButtons: [
      // {name: 'video', title: 'Shoot video (coming soon)'},
      // {name: 'uploadVideo', title: 'Choose video from library (coming soon)'},
      // ],
      noData: true,
      storageOptions: {
        skipBackup: true,
      }
    }
    ImagePicker.showImagePicker(options, (response) => {
      this.setState({spinner: true})
      console.log('Response = ', response)
  
      if (response.didCancel) {
        console.log('User cancelled image picker')
        this.setState({spinner: false})
      }
      else if (response.error) {
        Alert.alert('Error', response.error)
        this.setState({spinner: false})
      }
      else if (response.customButton) {
        if (response.customButton == 'uploadVideo') {
          ImagePicker.launchImageLibrary(videoOptions, (response)  => {
            if (response.error) {
              Alert.alert('Error',response.error)
              this.setState({spinner: false})
            }
          })
        }
        else if (response.customButton == 'video') {
          ImagePicker.launchCamera(videoOptions, (response)  => {
            if (response.error) {
              Alert.alert('Error', response.error)
              this.setState({spinner: false})
            }
          })
  
        }
      }
      else {
        const size = 640
        ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100).then((resized) => {
          this.setState({spinner: false})
          this.props.previewFile('image', resized.uri)
  
      }).catch((e) => {
        Alert.alert('Error', e.message)
        this.setState({spinner: false})
      })
  
  
      }
    })
  }

}

import { connect } from 'react-redux'
import {
  navigateMessaging,
  navigateProfile,
  navigateProfileView,
  navigateGym,
  navigateFilePreview,
  navigateBack
} from 'Anyone/js/actions/navigation'
import { sendRequest, acceptRequest } from 'Anyone/js/actions/friends'
import {
  fetchChats,
  fetchSessionChats,
  fetchMessages,
  fetchSessionMessages,
  fetchGymMessages,
  resetNotification,
  resetMessage
} from 'Anyone/js/actions/chats'
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
  message: chats.message,
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
  goToGym: (gym) => dispatch(navigateGym(gym)),
  resetMessage: () => dispatch(resetMessage()),
  previewFile: (type, uri) => dispatch(navigateFilePreview(type, uri, true)),
  goBack: () => dispatch(navigateBack())

})

export default connect(mapStateToProps, mapDispatchToProps)(Messaging)
