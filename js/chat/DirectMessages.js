import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList
} from "react-native"
import Image from 'react-native-fast-image'
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from 'react-native-firebase'
import colors from 'Anyone/js/constants/colors'
import {getSimplifiedTime } from '../constants/utils'
//import  styles  from './styles/loginStyles'

 class DirectMessages extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Pals',
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
    this.user = null,
    this.state = {
      chats: Object.values(this.props.chats),
      refreshing: false,
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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chats) {
      this.setState({chats: Object.values(nextProps.chats)})
    }
  }

  listenForChats(ref) {
    ref.on('child_added', snapshot => {
      if (!this.props.chats[snapshot.key]) {
        this.props.add(snapshot)
      }
    })
    ref.on('child_changed', snapshot => {
        this.props.add(snapshot)
    })
    ref.on('child_removed', snapshot => {
        this.props.remove(snapshot.key)
    })
  }

  sortByDate(array) {
    return array.sort((a,b) => {
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    })
  }



  render () {
    return (
    <Container>
    {this.state.chats.length > 0?
      this.renderChats() :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: colors.bgColor}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            {"You haven't started any chats yet, also please make sure you are connected to the internet"}
          </Text></View>}
    </Container>
  )
  }

  renderChats() {
    return <FlatList 
      style={{backgroundColor: colors.bgColor}}
      data={this.sortByDate(this.state.chats)}
      // refreshing={this.state.refreshing}
      // onRefresh={()=> {
      //   this.setState({refreshing: true})
      //   this.props.getChats().then(() => {
      //     this.setState({refreshing: false})
      //   })
      // }}
      keyExtractor={(chat)=> chat.chatId}
      renderItem={({item}) => {
        let friend = this.props.friends[item.uid]
        if (friend) {
        return <TouchableOpacity
          onPress={()=> {
            this.props.onOpenChat(item.chatId, friend.username, item.uid)
          }}>
            <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            {friend.avatar? <Image source={{uri: friend.avatar}} style={{height: 50, width: 50, borderRadius: 25}}/> :
                  <Icon name='md-contact'  style={{fontSize: 60, color: colors.primary}}/>}
              <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
                <Text>{friend.username}</Text>
                {!!item.lastMessage.text && <Text numberOfLines={1} style={{color: '#999'}}>{item.lastMessage.text}</Text>}
                {!item.lastMessage.text && item.lastMessage.image && <Text numberOfLines={1} style={{color: '#999', fontStyle: 'italic'}}>
                {item.lastMessage.user._id == this.props.profile.uid ? 'you sent an image' : 'sent you an image'}</Text>}
              </View>
               {item.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
                <Text style={{color: '#999'}}>{getSimplifiedTime(item.lastMessage.createdAt)}</Text></View>}
            </View>
          </TouchableOpacity>
        }
        else return null
      }}
    />
  }

}

import { connect } from 'react-redux'
import { navigateMessaging } from 'Anyone/js/actions/navigation'
import { fetchChats, addChat, removeChat } from 'Anyone/js/actions/chats'
import { fetchProfile } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.chats
})

const mapDispatchToProps = dispatch => ({
  getChats: (chats) => dispatch(fetchChats(chats)),
  getProfile: () => {return dispatch(fetchProfile())},
  onOpenChat: (chatId, friendUsername, friendUid) => dispatch(navigateMessaging(chatId, friendUsername, friendUid)),
  add: (chat) => dispatch(addChat(chat)),
  remove: (chat) => dispatch(removeChat(chat))
})

export default connect(mapStateToProps, mapDispatchToProps)(DirectMessages)
