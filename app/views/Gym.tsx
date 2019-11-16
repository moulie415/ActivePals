import React, { Component } from "react"
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Switch,
  Platform
} from "react-native"
import {
  Container
} from 'native-base'
import Icon from 'react-native-vector-icons/Ionicons'
import { PulseIndicator } from 'react-native-indicators'
import Text, { globalTextStyle } from '../components/Text'
import Image from 'react-native-fast-image'
import str from '../constants/strings'
import hStyles from '../styles/homeStyles'
import colors from '../constants/colors'
import { Image as SlowImage } from 'react-native'
import { deg2rad, getDistance  } from '../constants/utils'
import Hyperlink from 'react-native-hyperlink'
import Header from '../components/Header/header'
import { Popup } from 'react-native-map-link'
import globalStyles from '../styles/globalStyles'
import FriendsModal from '../components/friendsModal'
import Button from '../components/Button'
import styles from '../styles/gymStyles'

 class Gym extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Gym',
  }

  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.id = this.params.id
    
    this.props.fetchGym(this.id)
    .catch(e => {
        this.props.goBack()
        Alert.alert('Error', e.message)
    })

    this.user = null
    this.state = {
      isFriend: false,
      profile: {},
      showImage: false,
      popUpVisible: false
      //avatar: this.props.friends[this.uid] ? this.props.friends[this.uid].avatar : null
    }
  }

  render () {
    const gym = this.props.places[this.id]
    let yourLat, yourLon
    if (this.props.location) {
      yourLat = this.props.location.lat
      yourLon = this.props.location.lon
    }
    let locationString
    if (gym) {
      locationString = `${gym.vicinity} ${this.props.location ? '(' + getDistance(gym, yourLat, yourLon, true) + ' km away)' : ''}`
    }
    return (
    <Container>
    <Header 
    hasBack={true}
     title={gym && gym.name}
      />
      {gym ? <View style={{flex: 1}}>
        <ScrollView style={{backgroundColor: '#9993'}}>
        <View style={{alignItems: 'center', marginBottom: 20}}>
        {gym && gym.photo ?
      <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: gym.photo}} /> :
          <View style={{height: 150, width: '100%', backgroundColor: colors.primaryLighter, justifyContent: 'center'}}/>}
          <View style={globalStyles.shadow}>
          <SlowImage 
            style={{width: 80,
            padding: 10,
            height: 80,
            tintColor: colors.secondary,
            marginTop: -40,
            borderWidth: 1,
            borderColor: colors.secondary,
            backgroundColor: '#fff'}}
            source={require('Anyone/assets/images/dumbbell.png')}/>
            </View>
          </View>
          
          <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow}}>
            {this.props.gym && this.props.gym.place_id == this.id ? 
              <View style={[styles.infoRowContainer, styles.infoRowSpaceEvenly]}>
              <Button
              onPress={() => {
                  Alert.alert(
                      'Leave',
                      'Are you sure?',
                      [
                          {text: 'Cancel', style: 'cancel'},
                          {text: 'Yes', onPress: () => this.props.removeGym(), style: 'destructive'}
                      ]
                  )
                  }}
                style={{alignSelf: 'flex-start'}}
                text="Leave"
                color='red'/>
              <Button
                text="Chat"
                  onPress={() => {
                    this.props.onOpenGymChat(gym.place_id)
                  }}
                  style={{justifyContent: 'center', borderRadius: 5}} />
              
                {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text>Mute </Text>
                  <Switch
                  trackColor={{true: colors.secondary}}
                  thumbColor={Platform.select({android: this.props.muted[this.id] ? colors.secondary : '#fff'})}
                  value={this.props.muted[this.id]}
                  onValueChange={(val) => this.props.muteChat(this.id, val)} />
                  </View> */}
                </View> :
              <View style={styles.infoRowContainer}>
                <Button
                onPress={()=> {
                    if (this.props.gym) {
                        Alert.alert(
                        'Join',
                        'This will leave your current Gym?',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Yes', onPress: () => this.props.join(gym)}
                        ]
                    )
                    }
                    else this.props.join(gym)
                    
                    }}
                    style={{alignSelf: 'center'}}
                  text='Join'
                  />
              </View>}
            <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
              <View style={{flex: 4}}>
                {this.renderInfoHeader('Location')}
                  {gym.vicinity && <TouchableOpacity onPress={()=> Alert.alert(gym.name, locationString)}>
                  <Text numberOfLines={1} style={{color: '#999'}}>
                    {locationString}
                  </Text>
                  </TouchableOpacity>}
              </View>
                <Button onPress={()=> {
                const { lat, lng } = gym.geometry.location
                const place_id = gym.place_id

                const options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude:  this.props.location.lat,
                  sourceLongitude:   this.props.location.lon,
                  googlePlaceId: place_id, 
                  }
                  this.setState({popUpVisible: true, options})
                }}
                style={{marginLeft: 20, marginRight: 10, alignSelf: 'flex-start'}}
                text='Directions'
                />
            </View>
            {gym.website && <TouchableOpacity onPress={()=> {
              Linking.openURL(gym.website).catch(e => Alert.alert('Error', e.message))
              }}
            style={styles.infoRowContainer}>
            {this.renderInfoHeader('Website')}
              <Hyperlink linkDefault={true}>
                <Text numberOfLines={1} style={{color: colors.secondary, textDecorationLine: 'underline'}}>{gym.website}</Text>
              </Hyperlink>
            </TouchableOpacity>}
            {gym.rating && <View style={styles.infoRowContainer}>
              {this.renderInfoHeader('Google rating')}
              <Text style={{color: '#999'}}>
              <Text>{gym.rating.toFixed(2)}</Text>
              {gym.user_ratings_total && 
            <Text>{` from ${gym.user_ratings_total} ${gym.user_ratings_total > 1? 'ratings' : 'rating'}`}</Text>}
              </Text>
          </View>}
          <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
          {gym.formatted_phone_number && <TouchableOpacity onPress={() => {
            Linking.openURL(`tel:${gym.formatted_phone_number}`).catch(e => Alert.alert('Error', e.message))
          }}>
            {this.renderInfoHeader('Phone number')}
            <Text style={{color: '#999'}}>{gym.formatted_phone_number}</Text>
          </TouchableOpacity>}
          {gym.international_phone_number && <TouchableOpacity onPress={() => {
            Linking.openURL(`tel:${gym.international_phone_number}`).catch(e => Alert.alert('Error', e.message))
          }}>
            {this.renderInfoHeader('Intl phone number')}
            <Text style={{color: '#999'}}>{gym.international_phone_number}</Text>
          </TouchableOpacity>} 
          </View>

        {gym.opening_hours && gym.opening_hours.weekday_text && 
        <TouchableOpacity
        onPress={()=> Alert.alert('Opening hours', gym.opening_hours.weekday_text.join('\n'))} 
        style={styles.infoRowContainer}>
          {this.renderInfoHeader('Opening hours')}
          <Text style={{color: '#999'}}>{'Touch to see opening hours'}</Text>
        </TouchableOpacity>}

        </View>
        {gym && gym.users && <View style={{backgroundColor: '#fff', ...globalStyles.sectionShadow, marginTop:  20}}>
        <View style={[styles.rowSpaceBetween, {padding: 10}]}>
          {this.renderInfoHeader('Users')}
        </View>
          {this.renderUsers(gym.users)}
        </View>}
        </ScrollView> 
          <View style={{flexDirection: 'row', backgroundColor: colors.bgColor, paddingVertical: 10}}>
            <Button
            style={{flex: 1, marginLeft: 5, marginRight: 2, paddingVertical: 15}}
            text='Create Session'
            textStyle={{textAlign: 'center'}}
            onPress={()=> {
              this.props.createSession(gym)
            }}/>
              {/* <Text adjustsFontSizeToFit={true}
              style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Session</{'> */}
            <View style={{borderRightWidth: 1, borderRightColor: 'transparent'}}/>
            <Button
            style={{flex: 1, marginRight: 5, marginLeft: 2, paddingVertical: 15}}
            textStyle={{textAlign: 'center'}}
            text='Create Private Session'
            onPress={()=> {
              this.setState({friendsModalOpen: true})
            }}/>
              {/* <Text adjustsFontSizeToFit={true}
              style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Private Session</Text> */}
          </View>
        </View>
        
        : <View style={hStyles.spinner}><PulseIndicator color={colors.secondary} /></View>}
        {this.state.spinner && <View style={hStyles.spinner}><PulseIndicator color={colors.secondary}/></View>}
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
          onClosed={()=> this.setState({friendsModalOpen: false})}
          onContinue={(friends)=> this.props.navigateSessionDetail(friends, gym)}
          isOpen={this.state.friendsModalOpen} />
    </Container>
  )
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
            <Icon size={50} name='md-contact'  style={{color: colors.primary}}/>}
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

export const renderTags = (tags) => {
  let string = ""
  tags.forEach((tag, index, array) => {
    if (index === array.length - 1){
      string += tag
    }
    else string += tag + ", "
  })
  return string
}


import { connect } from 'react-redux'
import {
  navigateBack,
  navigateGymMessaging,
  navigateSessionDetail,
  navigateProfileView,
  navigateProfile
} from '../actions/navigation'
import { removeGym, joinGym } from '../actions/profile'
import { fetchGym } from '../actions/sessions'
import { muteChat } from '../actions/chats'


const mapStateToProps = ({ friends, sharedInfo, profile, sessions, chats }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  location: profile.location,
  places: sessions.places,
  muted: chats.muted
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  join: (location) => dispatch(joinGym(location)),
  removeGym: () => dispatch(removeGym()),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
  createSession: (location) => dispatch(navigateSessionDetail(null,location)),
  fetchGym: (id) => dispatch(fetchGym(id)),
  navigateSessionDetail: (friends, location) => dispatch(navigateSessionDetail(friends,location)),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  goToProfile: () => dispatch(navigateProfile()),
  muteChat: (id, mute) => dispatch(muteChat(id, mute))
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)