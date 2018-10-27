import React, { Component } from "react"
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from 'react-native-firebase'
import { getType, getSimplifiedTime } from 'Anyone/js/constants/utils'
import colors from 'Anyone/js/constants/colors'

//import  styles  from './styles/loginStyles'

 class SessionChats extends Component {
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
      chats: Object.values(this.props.chats),
    }
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.user = user
        //let sessionsRef = firebase.database().ref('users/' + this.user.uid).child('sessions')
      }
    })

  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.chats) {
      this.setState({chats: Object.values(nextProps.chats)})
    }
  }


  render () {
    return (
    <Container>
    {this.state.chats.length > 0 && this.state.chats[0].type ?
      <ScrollView style={{backgroundColor: '#9993'}}>
        {this.renderChats()}
      </ScrollView> :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            You haven't joined any sessions yet, join a session to start a session chat also please make sure you are connected to the internet
          </Text></View>}
    </Container>
  )
  }

  renderChats() {
    let list = []
    let index = 1
    this.state.chats.forEach(detail => {
      list.push(
        <TouchableOpacity
        key={index}
        onPress={()=> {
            this.props.onOpenChat(detail)
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <View>{getType(detail.type, 50)}</View>
            <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
              <Text numberOfLines={1} >{detail.title}</Text>
              <Text numberOfLines={1} style={{color: '#999'}}>{detail.lastMessage.text}</Text>
            </View>
            {detail.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
              <Text style={{color: '#999'}}>{getSimplifiedTime(detail.lastMessage.createdAt)}</Text></View>}
          </View>
        </TouchableOpacity>
        )
      index++
    })
    return list
  }

}


import { connect } from 'react-redux'
import { navigateMessagingSession } from 'Anyone/js/actions/navigation'
import { fetchSessionChats } from 'Anyone/js/actions/chats'

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats,
})

const mapDispatchToProps = dispatch => ({
  getChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onOpenChat: (session) => {return dispatch(navigateMessagingSession(session))}
})

export default connect(mapStateToProps, mapDispatchToProps)(SessionChats)