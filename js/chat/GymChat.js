import React, { Component } from "react"
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native'
import { Button, Text, Input, Container, Content,  Item, Icon } from 'native-base'
import firebase from 'react-native-firebase'
import { getType, getSimplifiedTime } from 'Anyone/js/constants/utils'
import colors from 'Anyone/js/constants/colors'

//import  styles  from './styles/loginStyles'

 class GymChat extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Gym',
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
      refreshing: false

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
    const gym = this.props.gym
    const gymChat = this.props.gymChat
    return (
    <Container>
    {this.props.gym ?
      <ScrollView 
      refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => {
              this.setState({refreshing: true})
              this.props.getChat(gym.place_id).then(() => {
                this.setState({refreshing: false})
              })
            }}
          />
        }
      style={{backgroundColor: '#9993'}}>
        <TouchableOpacity
        onPress={()=> {
            this.props.onOpenChat(gym.place_id)
        }}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <View>{getType('Gym', 50)}</View>
            <View style={{marginHorizontal: 10, flex: 1, justifyContent: 'center'}}>
              <Text numberOfLines={1} >{gym.name}</Text>
              { gymChat && !!gymChat.lastMessage.text && <Text numberOfLines={1} style={{color: '#999'}}>{gymChat.lastMessage.text}</Text>}
            </View>
            { gymChat && gymChat.lastMessage.createdAt && <View style={{marginHorizontal: 10}}>
              <Text style={{color: '#999'}}>{getSimplifiedTime(gymChat.lastMessage.createdAt)}</Text></View>}
          </View>
        </TouchableOpacity>
      </ScrollView> :
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#9993'}}>
            <Text style={{color: colors.primary, textAlign: 'center', marginHorizontal: 20}}>
            You haven't joined a Gym, please join a Gym if you want to participate in Gym chat
          </Text></View>}
    </Container>
  )
  }


}


import { connect } from 'react-redux'
import { navigateGymMessaging } from 'Anyone/js/actions/navigation'
import { fetchGymChat } from "../actions/chats";

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  gymChat: chats.gymChat
})

const mapDispatchToProps = dispatch => ({
  onOpenChat: (gymId) => {return dispatch(navigateGymMessaging(gymId))},
  getChat: (gym) => dispatch(fetchGymChat(gym))
})

export default connect(mapStateToProps, mapDispatchToProps)(GymChat)