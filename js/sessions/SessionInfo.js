import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native'
import {
  Container,
  Icon
} from 'native-base'
import Header from '../components/Header/header'
import firebase from 'react-native-firebase'
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

class SessionInfo extends Component {
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.sessionId = this.params.sessionId
    this.isPrivate  = this.params.isPrivate
    this.state = {
      session: null
    }
  }
  async componentDidMount() {
    const ref = this.isPrivate ? 'privateSessions' : 'sessions'
    const session = await firebase.database().ref(ref).child(this.sessionId).once('value')
    let host
    const sessionHost = session.val().host
    if (sessionHost == this.props.profile.uid) {
      host = this.props.profile
    }
    else if (this.props.friends[sessionHost]) {
      host = this.props.friends[sessionHost]
    }
    else if (this.props.users[sessionHost]) {
      host = this.props.users[sessionHost]
    }
    else {
      const user = await firebase.database().ref('users').child(sessionHost)
      host = user.val()
    }

    const users = Object.keys(session.val().users)
    const unFetched = []
    users.forEach(user => {
      if (!this.props.friends[user] || !this.props.users[user]) {
        unFetched.push(user)
      }
    })

    fetchUsers(unFetched)
    //TODO: set users afterwards
    if (session.val().gym) {
      const id = session.val().gym.place_id
      if (!this.props.places[id]) {
        this.props.fetchGym(id)
      }
    }
    this.setState({session: session.val(), host, users})
  }

  render() {
    let gym
    if (this.state.session && this.state.session.gym) {
      gym = this.props.places[this.state.session.gym.place_id]
    }
    return <Container style={{flex: 1, backgroundColor: '#9993'}}>
    <Header 
    hasBack={true}
    title={this.state.session ? this.state.session.title : ''}
    />
      {this.state.session ? 
      <View>
        <View style={{marginBottom: 20}}>
          {gym && gym.photo ?
            <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: gym.photo}} />
          : <View style={{height: 150, backgroundColor: colors.primaryLighter}}/>}
          <View style={{backgroundColor: '#fff', alignSelf: 'center', marginTop: -40, ...globalStyles.shadow}}>
            {getType(this.state.session.type, 80)}
          </View>
        </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow}}>
        <TouchableOpacity onPress={()=> Alert.alert('Details', this.state.session.details)} style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          <View style={{flex: 4}}>
            {this.renderInfoHeader('Details')}
            <Text numberOfLines={1} style={{color: '#999'}}>{this.state.session.details}</Text>
          </View>
          {this.isPrivate && <PrivateIcon style={{flex: 1}}/>}
        </TouchableOpacity>
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          <View>
            {this.renderInfoHeader('Date')}
            <Text style={{color: '#999'}}>{(formatDateTime(this.state.session.dateTime))
              + " for " + (this.state.session.duration) + " " +
              (this.state.session.duration > 1 ? 'hours' : 'hour') }</Text>
          </View>
          <View style={{marginRight: 20}}>
            {this.renderInfoHeader('Gender')}
            <Text style={{color: '#999'}}>{this.state.session.gender}</Text>
          </View>
        </View>
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
        <View style={{flex: 3}}>
          {this.renderInfoHeader('Location')}
          <Text numberOfLines={1} style={{color: '#999'}}>{this.state.session.location.formattedAddress}</Text>
        </View>
        {this.props.location && <View style={{flex: 1}}>
        <Button onPress={()=> {
          const { lat, lng } = this.state.session.location.position
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
        <TouchableOpacity 
        onPress={() => this.handleUserPress(this.state.host.uid)}
        style={[styles.infoRowContainer, styles.userRow]}>
         <View
            style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}
            >
            {this.state.host.avatar ? <Image source={{uri: this.state.host.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
            <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
          </View>
          <View style={{marginRight: 10}}>
            {this.renderInfoHeader('Host')}
            <Text style={{color: '#999'}}>{this.state.host.username}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow, marginTop:  20}}>
        <View style={[styles.rowSpaceBetween, {padding: 5, paddingHorizontal: 10}]}>
          {this.renderInfoHeader('Users')}
          {(!this.isPrivate || this.props.profile.uid == this.state.host.uid)  && 
          <TouchableOpacity onPress={()=> this.setState({friendsModalOpen: true})}>
            <Icon style={{color: colors.secondary, fontSize: 40, marginRight: 10}} name="add"/>
          </TouchableOpacity>}
        </View>
        {this.state.session && this.renderUsers()}
      </View>
      </View> : 
      <PulseIndicator color={colors.secondary} />}
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
          <FriendsModal 
          title="Add Pals to Session"
          onClosed={()=> this.setState({friendsModalOpen: false})}
          onContinue={(friends) => console.log(friends)}
          isOpen={this.state.friendsModalOpen}/>
    </Container>
  }

  renderInfoHeader(text) {
    return <Text style={{fontSize: 18}}>{text}</Text>
  }

  renderUsers() {
   return this.state.users.map(user => {
     let userItem = this.props.friends[user] || this.props.users[user]
     if (user == this.props.profile.uid) userItem = this.props.profile
     if (userItem) {
      return <TouchableOpacity onPress={()=> this.handleUserPress(user)} style={[styles.infoRowContainer, styles.userRow]} key={user}> 
        {userItem.avatar ? <Image source={{uri: userItem.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
           <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
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

}

import { connect } from 'react-redux'
import {
  navigateProfileView,
  navigateGym,
  navigateProfile,
} from '../actions/navigation'
import { fetchGym } from '../actions/sessions'
import { fetchUsers } from '../actions/home'

const mapStateToProps = ({ profile, sharedInfo, friends, sessions }) => ({
  profile: profile.profile,
  users: sharedInfo.users,
  friends: friends.friends,
  location: profile.location,
  places: sessions.places
})

const mapDispatchToProps = dispatch => ({
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  fetchGym: (id) => dispatch(fetchGym(id)),
  viewGym: (id) => dispatch(navigateGym(id)),
  goToProfile: () => dispatch(navigateProfile()),
})

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfo)