import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  ScrollView
} from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from '../index'
import colors from 'Anyone/constants/colors'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
//import  styles  from './styles/loginStyles'

 export default class DirectMessages extends Component {
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
      chats: [],
      users: []
    }
  }

  //have dms and session chat tabs at top

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
        this.fetchUsers()
      }
    })
  }

  listenForChats(ref) {
    ref.on('value', snapshot => {
      let chats = []
      let i = 1
      snapshot.forEach(child => {
        chats.push({uid: child.key, chatId: child.val(), key: i})
        this.setState({chats})
        i++
      })
      this.fetchUsers()
    })
  }

  fetchUsers() {
    let users = []
    this.state.chats.forEach(chat => {
      let id = chat.chatId
      firebase.database().ref('users/' + chat.uid).once('value')
      .then(snapshot => {
        firebase.database().ref('chats').child(id).orderByKey().limitToLast(1)
        .once('value', lastMessage => {
          let message = lastMessage.val()[Object.keys(lastMessage.val())[0]]
          users.push({...snapshot.val(), chatId: id, lastMessage: message.text})
          this.setState({users})
          console.log(users)
        })
      })
    })
  }



  render () {
    return (
    <Container>
    {this.state.chats.length > 0?
      <ScrollView>
        {this.getChats()}
      </ScrollView> :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You haven't started any chats yet, also please make sure you are connected to the internet
          </Text></View>}
    </Container>
  )
  }

  getChats() {
    let list = []
    let index = 1
    this.state.users.forEach(user => {
      list.push(
        <TouchableOpacity 
        key={index}
        onPress={()=> {
          this.nav.navigate('Messaging', 
            {chatId: user.chatId, uid: this.user.uid, friendUid: user.uid, friendUsername: user.username})
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
          <Icon name='md-contact'  style={{fontSize: 40, color: colors.primary}}/>
            <View style={{marginHorizontal: 10, flex: 1}}>
              <Text>{user.username}</Text>
              <Text numberOfLines={1} style={{color: '#999'}}>{user.lastMessage}</Text>
            </View>
          </View>
        </TouchableOpacity>
        )
      index++
    })
    return list
  }

}