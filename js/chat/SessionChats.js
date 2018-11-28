import React, { Component } from "react"
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native'
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from 'react-native-firebase'
import { getType, getSimplifiedTime } from 'Anyone/js/constants/utils'
import colors from 'Anyone/js/constants/colors'

//import  styles  from './styles/loginStyles'

 class SessionChats extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Sessions',
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
        this.renderChats() :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgColor}}>
            <Text style={{color: colors.primary, textAlign: 'center', marginHorizontal: 20}}>
            You haven't joined any sessions yet, join a session to start a session chat also please make sure you are connected to the internet
          </Text></View>}
    </Container>
  )
  }

  sortByDate(array) {
    return array.sort((a,b) => {
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    })
  }

  renderChats() {
    return <FlatList 
      style={{backgroundColor: colors.bgColor}}
      data={this.sortByDate(this.state.chats)}
      keyExtractor={(chat) => chat.key}
      renderItem={({item}) => {
        return <TouchableOpacity
        onPress={()=> {
            this.props.onOpenChat(item)
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <View>{getType(item.type, 50)}</View>
            <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
              <Text numberOfLines={1} >{item.title}</Text>
              <Text numberOfLines={1} style={{color: '#999'}}>{item.lastMessage.text}</Text>
              {!!item.lastMessage.text && <Text numberOfLines={1} style={{color: '#999'}}>{item.lastMessage.text}</Text>}
            </View>
            {item.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
              <Text style={{color: '#999'}}>{getSimplifiedTime(item.lastMessage.createdAt)}</Text></View>}
          </View>
        </TouchableOpacity>
      }}
    />

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