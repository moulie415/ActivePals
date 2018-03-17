import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  ScrollView,
  TouchableOpacity 
} from "react-native"
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from '../index'
import { getType } from 'Anyone/constants/utils'
import colors from 'Anyone/constants/colors'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'

//import  styles  from './styles/loginStyles'

 export default class SessionChats extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Session Chats',
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
      email: "",
      username: "",
      sessions: [],
      details: []
    }
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        let sessionsRef = firebase.database().ref('users/' + this.user.uid).child('sessions')
        this.listenForSessionChats(sessionsRef)
      }
    })  
    FCM.on(FCMEvent.Notification, async (notif) => {
      //update last message on notification
      if (notif.type == 'sessionMessage') {
        this.fetchDetail()
      }
    })
  }

  listenForSessionChats(ref) {
    ref.on('value', snapshot => {
      let sessions = []
      let i = 1
      snapshot.forEach(child => {
        sessions.push(child.key)
        this.setState({sessions})
        i++
      })
      this.fetchDetail()
    })
  }

  fetchDetail() {
    let details = []
    this.state.sessions.forEach(session => {
      firebase.database().ref('sessions/' + session).once('value')
      .then(snapshot => {
        if (snapshot.val()) {
          firebase.database().ref('sessions/'+ session).child('chat').orderByKey().limitToLast(1)
          .once('value', lastMessage => {
            let message = {text: "new group created"}
            if (lastMessage.val()) {
              message = Object.values(lastMessage.val())[0]
            }
            details.push({...snapshot.val(), id: session, lastMessage: message.text})
            this.setState({details})
          })
        }
        else {
          firebase.database().ref('users/' + this.user.uid + '/sessions').child(session).remove()
          FCM.unsubscribeFromTopic(session)
        }
      })
      })
  }



  render () {
    return (
    <Container>
    {this.state.sessions.length > 0?
      <ScrollView>
        {this.getChats()}
      </ScrollView> :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You haven't joined any sessions yet, join a session to start a session chat also please make sure you are connected to the internet
          </Text></View>}
    </Container>
  )
  }

  getChats() {
    let list = []
    let index = 1
    this.state.details.forEach(detail => {
      list.push(
        <TouchableOpacity 
        key={index}
        onPress={()=> {
          this.nav.navigate('Messaging', 
            {sessionId: detail.id, uid: this.user.uid, session: {...detail}})
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <View>{getType(detail.type, 40)}</View>
            <View style={{marginHorizontal: 10, flex: 1}}>
              <Text>{detail.title}</Text>
              <Text numberOfLines={1} style={{color: '#999'}}>{detail.lastMessage}</Text>
            </View>
          </View>
        </TouchableOpacity>
        )
      index++
    })
    return list
  }


}