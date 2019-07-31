import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Platform
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
    let gym
    if (session.val().gym) {
      const id = session.val().gym.place_id
      if (this.props.places[id]) {
        gym = this.props.places[id]
      }
      else {
        await this.props.fetchGym(id)
        gym = this.props.places[id]
      }
    }
    this.setState({session: session.val(), host, gym, users})
  }

  render() {
    return <Container style={{flex: 1, backgroundColor: '#9993'}}>
    <Header 
    hasBack={true}
    title={this.state.session ? this.state.session.title : ''}
    />
      {this.state.session ? 
      <View>
        <View style={{marginBottom: 20}}>
          {this.state.gym && this.state.gym.photo ?
            <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: this.state.gym.photo}} />
          : <View style={{height: 150, backgroundColor: colors.primaryLighter}}/>}
          <View style={{backgroundColor: '#fff', alignSelf: 'center', marginTop: -40, ...globalStyles.shadow}}>
            {getType(this.state.session.type, 80)}
          </View>
        </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow}}>
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          <View>
            {this.renderInfoHeader('Details')}
            <Text style={{color: '#999'}}>{this.state.session.details}</Text>
          </View>
          {this.isPrivate && <PrivateIcon />}
        </View>
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
        <View>
          {this.renderInfoHeader('Location')}
          <Text style={{color: '#999'}}>{this.state.session.location.formattedAddress}</Text>
        </View>
        {this.props.location && <Button onPress={()=> {
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
        />}
        </View>
        {this.state.gym && <TouchableOpacity 
        onPress={() => this.props.viewGym(this.state.gym.place_id)}
        style={[styles.infoRowContainer, styles.hostRow]}>
        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 10}}>
            {this.state.gym.photo ? <Image source={{uri: this.state.gym.photo}}
            style={{height: 40, width: 40, borderRadius: 25}}/> :
            getType('gym', 40)
            }
          </View>
          <View >
            {this.renderInfoHeader('Gym')}
            <Text style={{color: '#999'}}>{this.state.gym.name}</Text>
          </View>
            
        </TouchableOpacity>}
        <TouchableOpacity 
        onPress={() => {
              if (this.state.host.uid == this.props.profile.uid) {
                this.props.goToProfile()
              }
              else this.props.viewProfile(this.state.host.uid)
            }}
        style={[styles.infoRowContainer, styles.hostRow]}>
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
        <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          {this.renderInfoHeader('Users')}
          {(!this.isPrivate || this.props.profile.uid == this.state.host.uid)  && <TouchableOpacity>
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
    </Container>
  }

  renderInfoHeader(text) {
    return <Text style={{fontSize: 18}}>{text}</Text>
  }

  renderUsers() {
   return this.state.users.map(user => {
     const userItem = this.props.friends[user] || this.props.users[user]
     if (userItem) {
      return <TouchableOpacity key={user}> 
        {userItem.avatar ? <Image source={{uri: userItem.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
           <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
      </TouchableOpacity>
     }
     else if (user == this.props.profile.uid) {
       const you = this.props.profile
      return <TouchableOpacity key={user}> 
        {you.avatar ? <Image source={{uri: you.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
           <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
      </TouchableOpacity>
     }
     else return null
    })
  }

}

import { connect } from 'react-redux'
import {
  navigateProfileView,
  navigateGym,
  navigateProfile,
} from '../actions/navigation'
import { fetchGym } from '../actions/sessions'
import { fetchUsers } from '../actions/home';

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