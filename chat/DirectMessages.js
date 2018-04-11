import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Image
} from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from '../index'
import colors from 'Anyone/constants/colors'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
import {getSimplified } from './SessionChats'
//import  styles  from './styles/loginStyles'

 class DirectMessages extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Direct Messages',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-chatboxes'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.nav = this.props.navigation
    this.user = null
    this.state = {
      chats: this.props.chats,
    }
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        let chatRef = firebase.database().ref('users/' + this.user.uid).child('chats')
        this.listenForChats(chatRef)
      }
    })  
    FCM.on(FCMEvent.Notification, async (notif) => {
      //update last message on notification
      if (notif.type == 'message') {
        this.props.getChats(this.props.profile.chats)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chats) {
      this.setState({chats: nextProps.chats})
    }
    if (nextProps.profile.chats) {
      this.props.getChats(nextProps.profile.chats)
    }
  }

  listenForChats(ref) {
    ref.on('value', snapshot => {
      let chats = []
      snapshot.forEach(child => {
        let exists = false
        this.state.chats.forEach(chat => {
          if (child.val() == chat.chatId) {
            exists = true
          }
        })
        if (!exists) {
          chats.push(child.val())
        }
      })
      if (chats.length > 0) {
        this.props.getProfile()
      }
      else if (snapshot.val() && Object.keys(snapshot.val()).length 
        != this.state.chats.length) {
        this.props.getProfile()
      }

    })
  }



  render () {
    return (
    <Container>
    {this.state.chats.length > 0?
      <ScrollView>
        {this.renderChats()}
      </ScrollView> :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You haven't started any chats yet, also please make sure you are connected to the internet
          </Text></View>}
    </Container>
  )
  }

  renderChats() {
    let list = []
    let index = 1
    this.state.chats.forEach(chat => {
      let friend = this.props.friends.filter(friend => friend.uid == chat.uid)[0]
      if (friend) {
        list.push(
          <TouchableOpacity 
          key={index}
          onPress={()=> {
            this.props.onOpenChat(chat.chatId, friend.username, chat.uid)
          }}>
            <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            {friend.avatar? <Image source={{uri: friend.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                  <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
              <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
                <Text>{friend.username}</Text>
                <Text numberOfLines={1} style={{color: '#999'}}>{chat.lastMessage.text}</Text>
              </View>
               {chat.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
                <Text style={{color: '#999'}}>{getSimplified(chat.lastMessage.createdAt)}</Text></View>}
            </View>
          </TouchableOpacity>
          )
      index++
    }
    })
    return list
  }

}

import { connect } from 'react-redux'
import { navigateMessaging } from 'Anyone/actions/navigation'
import { fetchChats } from 'Anyone/actions/chats'
import { fetchProfile } from 'Anyone/actions/profile'

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.chats
})

const mapDispatchToProps = dispatch => ({
  getChats: (chats) => {return dispatch(fetchChats(chats))},
  getProfile: () => {return dispatch(fetchProfile())},
  onOpenChat: (chatId, friendUsername, friendUid) => dispatch(navigateMessaging(chatId, friendUsername, friendUid))
})

export default connect(mapStateToProps, mapDispatchToProps)(DirectMessages)