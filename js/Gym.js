import React, { Component } from "react"
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Linking
} from "react-native"
import {
  Container,
  Icon,
} from 'native-base'
import { PulseIndicator } from 'react-native-indicators'
import Text, { globalTextStyle } from 'Anyone/js/components/Text'
import Image from 'react-native-fast-image'
import str from './constants/strings'
import hStyles from './styles/homeStyles'
import colors from './constants/colors'
import { Image as SlowImage } from 'react-native'
import { deg2rad  } from './constants/utils'
import Hyperlink from 'react-native-hyperlink'
import Header from './components/Header/header'
import StarRating from 'react-native-star-rating'
import { Popup } from 'react-native-map-link'
import globalStyles from './styles/globalStyles'
import FriendsModal from './components/friendsModal'
import Button from './components/Button'
import styles from './styles/gymStyles'

 class Gym extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Gym',
  }

  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.id = this.params.id
    
    this.props.fetchGym(this.id).then(gym => {
        this.setState({ loaded: true})
    })
    .catch(e => {
        this.props.goBack()
        Alert.alert('Error', e.message)
    })

    this.user = null
    this.state = {
      isFriend: false,
      profile: {},
      showImage: false,
      loaded: false,
      popUpVisible: false
      //avatar: this.props.friends[this.uid] ? this.props.friends[this.uid].avatar : null
    }
  }

  render () {
    const gym = this.props.places[this.id]
    return (
    <Container>
    <Header 
    hasBack={true}
     title={gym && gym.name}
      />
      {this.state.loaded ? <View style={{flex: 1}}>
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
              <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Your active gym</Text>
              <TouchableOpacity 
                  onPress={() => {
                    this.props.onOpenGymChat(gym.place_id)
                  }}
                  style={{justifyContent: 'center', marginRight: 20, borderRadius: 5}}>
                  <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 40}}/>
              </TouchableOpacity>
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
                color='red'/></View> :
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
              <View>
                {this.renderInfoHeader('Location')}
                  {gym.vicinity && <Text numberOfLines={1} style={{color: '#999'}}>
                    {`${gym.vicinity} ${this.props.location ? '(' + this.getDistance(gym) + ' km away)' : ''}`}
                  </Text>}
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
                <Text style={{color: colors.secondary, textDecorationLine: 'underline'}}>{gym.website}</Text>
              </Hyperlink>
            </TouchableOpacity>}
            {gym.rating && <View style={styles.infoRowContainer}>
              {this.renderInfoHeader('Google rating')}
              <Text style={{color: '#999'}}>
              <Text>{gym.rating}</Text>
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
        <View style={{marginHorizontal: 10, marginTop: 10}}>
          <Text style={{color: '#999'}}>Opening Hours:</Text>
          <View style={{marginLeft: 5}}>{this.renderOpeningHours(gym.opening_hours.weekday_text)}</View>
        </View>}
        {gym.types && <Text style={{fontSize: 12, color: '#999', marginVertical: 5, marginLeft: 10}}>{"Tags: " + renderTags(gym.types)}</Text>}
        </View>
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
  getDistance(item) {
    if (item.geometry) {
      let lat1 = this.props.location.lat
      let lon1 =  this.props.location.lon
      let lat2 = item.geometry.location.lat
      let lon2 = item.geometry.location.lng
      let R = 6371
      let dLat = deg2rad(lat2 - lat1)
      let dLon = deg2rad(lon2 - lon1)
      let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      let d = R * c
      return d.toFixed(2)
    }
    else return 'N/A'
  }

  renderOpeningHours(hours) {
    return hours.map(hour => {
      return <Text key={hour} style={{marginVertical: 5, color: colors.secondary}}>{hour}</Text>
    })
  }

  renderInfoHeader(text) {
    return <Text style={{fontSize: 18}}>{text}</Text>
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
import { navigateBack, navigateGymMessaging, navigateSessionDetail } from './actions/navigation'
import { removeGym, joinGym } from './actions/profile'
import { fetchGym } from './actions/sessions'


const mapStateToProps = ({ friends, sharedInfo, profile, sessions }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  location: profile.location,
  places: sessions.places
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  join: (location) => dispatch(joinGym(location)),
  removeGym: () => dispatch(removeGym()),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
  createSession: (location) => dispatch(navigateSessionDetail(null,location)),
  fetchGym: (id) => dispatch(fetchGym(id)),
  navigateSessionDetail: (friends, location) => dispatch(navigateSessionDetail(friends,location))
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)