import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native'
import {
  Icon,
  Container
} from 'native-base'
import Header from '../components/Header/header'
import Text from '../components/Text'
import colors from '../constants/colors'
import { PulseIndicator } from 'react-native-indicators'
import { getType, formatDateTime } from '../constants/utils'
import Image from 'react-native-fast-image'
import globalStyles from '../styles/globalStyles'
import styles from '../styles/sessionStyles'
import Button from '../components/Button'
import { Popup } from 'react-native-map-link'
import PrivateIcon from '../components/PrivateIcon'
import FriendsModal from '../components/friendsModal'
import RNCalendarEvents from 'react-native-calendar-events'
import { addSessionToCalendar } from '../constants/utils'

class SessionInfo extends Component {
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.sessionId = this.params.sessionId
    this.isPrivate  = this.params.isPrivate
    this.state = {
      popUpVisible: false
    }
  }
  componentDidMount() {
    this.isPrivate ? this.props.fetchPrivateSession(this.sessionId) : this.props.fetchSession(this.sessionId)
  }

  render() {
    const session = this.props.sessions[this.sessionId] || this.props.privateSessions[this.sessionId]
    let host
    if (session && session.host.uid == this.props.profile.uid) {
      host = this.props.profile
    }
    else if (session && session.host){
      host = this.props.friends[session.host.uid] || this.props.users[session.host.uid]
    }
    
    let gym
    if (session && session.gym) {
      gym = this.props.places[session.gym.place_id]
    }

    return <Container>
    <Header 
    hasBack={true}
    title={session ? session.title : ''}
    />
    <ScrollView style={{backgroundColor: '#9993'}}>
      {session ? <View>
        <View style={{marginBottom: 20}}>
          {gym && gym.photo ?
            <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: gym.photo}} />
          : <View style={{height: 150, backgroundColor: colors.primaryLighter}}/>}
          <View style={{backgroundColor: '#fff', alignSelf: 'center', marginTop: -40, ...globalStyles.shadow, padding: 5}}>
            {getType(session.type, 80)}
          </View>
        </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow}}>
        {session && host && this.getButtons(host, session)}
        <TouchableOpacity onPress={()=> Alert.alert('Details', session.details)} style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          <View >
            {this.renderInfoHeader('Details')}
            <Text numberOfLines={1} style={{color: '#999'}}>{session.details}</Text>
          </View>
          {this.isPrivate && <PrivateIcon/>}
          <View>
            {this.renderInfoHeader('Gender')}
            <Text style={{color: '#999'}}>{session.gender}</Text>
            </View>
        </TouchableOpacity>
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          <View>
            {this.renderInfoHeader('Date')}
            <Text numberOfLines={1} style={{color: '#999'}}>{(formatDateTime(session.dateTime))
              + " for " + (session.duration) + " " +
              (session.duration > 1 ? 'hours' : 'hour') }</Text>
          </View>
          <Button onPress={() => {
            Alert.alert(
              `Add ${session.title} to calendar?`,
              '',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Yes', onPress: async ()=> {
                  try {
                    const result = await RNCalendarEvents.authorizeEventStore()
										if (result == 'authorized') {
											const calendars = await RNCalendarEvents.findCalendars()
											const validList = calendars.filter(calendar => calendar.allowsModifications)
											if (validList && validList.length > 0) {
												const calendarId = validList[0].id
                        await addSessionToCalendar(calendarId, session)
                        Alert.alert('Success', session.title + ' saved to calendar')
											}
											else {
												Alert.alert("Sorry", "You don't have any calendars that allow modification")
											}
										}
                  } catch(e) {
                    Alert.alert('Error', e.message)
                  }
                }}
              ]
            )
          }}
          text='Add to calendar'/>
        </View>
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
        <View style={{flex: 3}}>
          {this.renderInfoHeader('Location')}
          <Text numberOfLines={1} style={{color: '#999'}}>{session.location.formattedAddress}</Text>
        </View>
        {this.props.location && <View style={{flex: 1}}>
        <Button onPress={()=> {
          const { lat, lng } = session.location.position
          const options = {
            latitude: lat,
            longitude: lng,
            cancelText: 'Cancel',
            sourceLatitude: this.props.location.latitude,  
            sourceLongitude: this.props.location.longitude,  
            }
            this.setState({popUpVisible: true, options})
          }}
          text='Directions'
        /></View>}
        </View>
        {gym && <TouchableOpacity 
        onPress={() => this.props.viewGym(gym.place_id)}
        style={[styles.infoRowContainer, styles.userRow]}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}>
            {gym.photo ? <Image source={{uri: gym.photo}}
            style={{height: 40, width: 40, borderRadius: 25}}/> :
            getType('gym', 40)
            }
          </View>
          <View >
            {this.renderInfoHeader('Gym')}
            <Text style={{color: '#999'}}>{gym.name}</Text>
          </View>
            
        </TouchableOpacity>}
        {host && <TouchableOpacity 
        onPress={() => this.handleUserPress(host.uid)}
        style={[styles.infoRowContainer, styles.userRow, { paddingVertical: host.avatar ? 10 : 5}]}>
         <View
            style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}
            >
            {host.avatar ? <Image source={{uri: host.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
            <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary}}/>}
          </View>
          <View style={{marginRight: 10}}>
            {this.renderInfoHeader('Host')}
            <Text style={{color: '#999'}}>{host.username}</Text>
          </View>
        </TouchableOpacity>}
      </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow, marginTop:  20}}>
        <View style={[styles.rowSpaceBetween, {padding: 5, paddingHorizontal: 10}]}>
          {this.renderInfoHeader('Users')}
          
          {(!this.isPrivate || (host && this.props.profile.uid == host.uid))  && 
          <TouchableOpacity onPress={()=> this.setState({friendsModalOpen: true})}>
            <Icon style={{color: colors.secondary, fontSize: 40, marginRight: 10}} name="add"/>
          </TouchableOpacity>}
        </View>
        {session && this.renderUsers(session.users)}
      </View>  
      </View> : <PulseIndicator color={colors.secondary} />}
      <Popup
          isVisible={this.state.popUpVisible}
          onCancelPressed={() => this.setState({ popUpVisible: false })}
          onAppPressed={() => this.setState({ popUpVisible: false })}
          onBackButtonPressed={() => this.setState({ popUpVisible: false })}
          modalProps={{ 
              animationIn: 'slideInUp'
          }}
          options={this.state.options}
          style={{
            cancelButtonText: {color: colors.secondary},
          }}
          />
    </ScrollView>
    <FriendsModal 
          title="Add Pals to Session"
          onClosed={()=> this.setState({friendsModalOpen: false})}
          onContinue={async (friends) => {
            const invites = []
  
            friends.forEach(friend => {
              if (!Object.values(session.users).some(user => friend == user)) {
                invites.push(this.props.addUser(session.key, session.private, friend))
              }
            })
            await Promise.all(invites)
            Alert.alert('Success', (friends.length > 1  ? 'Pals' : 'Pal') + ' added')
            this.setState({friendsModalOpen: false})
          }}
          isOpen={this.state.friendsModalOpen}/>
    </Container>
  }

  renderInfoHeader(text) {
    return <Text style={{fontSize: 18}}>{text}</Text>
  }

  renderUsers(users) {
   return Object.keys(users).map(user => {
     let userItem = this.props.friends[user] || this.props.users[user]
     if (user == this.props.profile.uid) userItem = this.props.profile
     if (userItem) {
      return <TouchableOpacity
      onPress={()=> this.handleUserPress(user)}
      style={[styles.infoRowContainer, styles.userRow, { paddingVertical: userItem.avatar ? 10 : 5}]}
      key={user}> 
        {userItem.avatar ? <Image source={{uri: userItem.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
           <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary}}/>}
           <Text style={{marginLeft: 10}}>{userItem.username}</Text>
      </TouchableOpacity>
     }
     else return null
    })
  }

  handleUserPress(uid) {
    if (uid == this.props.profile.uid) {
      this.props.goToProfile()
    }
    else this.props.viewProfile(uid)
  }

chatButton(session) {
  return <Button  text="Chat" onPress={()=> this.props.openSessionChat(session)}/>
//   return <TouchableOpacity
//     onPress={()=> this.props.openSessionChat(session)}>
//   <Icon name='md-chatboxes' style={{color: colors.secondary, paddingHorizontal: 10}}/>
// </TouchableOpacity>
}

  getButtons(host, session) {
    const you = this.props.profile.uid
    if (session.users[you]){
      if (host.uid == you) {
        return (
          <View style={styles.infoRowSpaceEvenly}>
            <Button
            onPress={()=> {
              Alert.alert(
                "Delete session",
                "Are you sure?",
                [
                {text: 'cancel', style: 'cancel'},
                {text: 'Yes', onPress: ()=> {
                  this.props.remove(this.sessionId, session.private)
                  this.props.goBack()
                },
                style: 'destructive'}
                ],
              )
            }}
            style={{alignSelf: 'center'}}
            color='red'
            text="Delete"
            />
            {this.chatButton(session)}
          </View>
          )
      }
      else return (
        <View style={styles.infoRowSpaceEvenly}>
          <Button
          color='red'
          text="Leave"
          style={{alignSelf: 'center'}}
          onPress={()=> {
            this.props.remove(this.sessionId, session.private)
            this.props.goBack()
          }}
          />
          {this.chatButton(session)}
          </View>
        )
    }
    else {
      return (
        <View style={styles.infoRowSpaceEvenly}>
          <Button
          text="Join"
          style={{alignSelf: 'center'}}
          onPress={async ()=> {
            try {
              await this.props.addUser(this.sessionid, session.private, this.props.profile.uid)
              Alert.alert('Session joined', 'You should now see this session in your session chats')
            } catch(e) {
              Alert.alert('Error', e.message)
            }
          }}
          />
        </View>
      )
    }
  }

}

import { connect } from 'react-redux'
import {
  navigateProfileView,
  navigateGym,
  navigateProfile,
  navigateBack,
  navigateMessagingSession
} from '../actions/navigation'
import {
  fetchGym,
  removeSession,
  addUser,
  fetchSession,
  fetchPrivateSession
} from '../actions/sessions'
import {
  addSessionChat
} from '../actions/chats'

const mapStateToProps = ({ profile, sharedInfo, friends, sessions }) => ({
  profile: profile.profile,
  users: sharedInfo.users,
  friends: friends.friends,
  location: profile.location,
  places: sessions.places,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions
})

const mapDispatchToProps = dispatch => ({
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  fetchGym: (id) => dispatch(fetchGym(id)),
  viewGym: (id) => dispatch(navigateGym(id)),
  goToProfile: () => dispatch(navigateProfile()),
  goBack: ()=> dispatch(navigateBack()),
  remove: (key, type) => dispatch(removeSession(key, type)),
  addUser: (session, isPrivate, uid) => {
    dispatch(addUser(session, isPrivate, uid))
    return dispatch(addSessionChat(session, isPrivate))
  },
  fetchSession: (id) => dispatch(fetchSession(id)),
  fetchPrivateSession: (id) => dispatch(fetchPrivateSession(id)),
  openSessionChat: (session) => dispatch(navigateMessagingSession(session))
})

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfo)