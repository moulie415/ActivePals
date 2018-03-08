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
      <ScrollView>
        {this.getChats()}
      </ScrollView>
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