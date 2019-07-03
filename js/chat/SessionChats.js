import React, { Component } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { Text, Container } from 'native-base'
import firebase from 'react-native-firebase'
import { getType, getSimplifiedTime } from 'Anyone/js/constants/utils'
import colors from 'Anyone/js/constants/colors'
import ChatTabBarIcon from '../components/ChatTabBarIcon'
import ChatTabLabel from '../components/ChatTabLabel'
import ChatRowCount from '../components/ChatRowCount'
//import  styles  from './styles/loginStyles'

 class SessionChats extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: ({tintColor}) => <ChatTabLabel type='Sessions' color={tintColor}/>,
    tabBarIcon: ({ tintColor }) => <ChatTabBarIcon  color={tintColor} />,
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

  render () {
    return (
    <Container>
    {Object.values(this.props.chats).length > 0 && 
    Object.values(this.props.chats)[0].type ?
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
      data={this.sortByDate(Object.values(this.props.chats))}
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
              {!!item.lastMessage.text && <Text numberOfLines={1} style={{color: '#999'}}>{item.lastMessage.text}</Text>}
            </View>
            {item.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
              <Text style={{color: '#999'}}>{getSimplifiedTime(item.lastMessage.createdAt)}</Text></View>}
              <ChatRowCount id={item.key} />
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