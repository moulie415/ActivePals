import React, { Component } from "react"
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
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
import { deg2rad  } from './Sessions'
import Hyperlink from 'react-native-hyperlink'
import Header from './header/header'
import StarRating from 'react-native-star-rating'
import { showLocation, Popup } from 'react-native-map-link'
import globalStyles from './styles/globalStyles'
import FriendsModal from './components/friendsModal'




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
     title={'Gym'}
      />
        <View style={{alignItems: 'center', marginBottom: 10}}>
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
        {this.state.loaded ? <View style={{flex: 1}}>
        <ScrollView>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{gym.name}</Text>
            {this.props.gym && gym.place_id == this.id ? 
              <View style={{justifyContent: 'space-between', flexDirection: 'row', margin: 10}}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Your active gym</Text>
              <TouchableOpacity 
                  onPress={() => {
                    this.props.onOpenGymChat(gym.place_id)
                  }}
                  style={{justifyContent: 'center', marginRight: 20, borderRadius: 5}}>
                  <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 40}}/>
              </TouchableOpacity>
              <TouchableOpacity 
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
              style={{padding: 5, paddingVertical: 10, alignSelf: 'center', marginBottom: 5, backgroundColor: 'red', borderRadius: 5}}>
              <Text style={{color: '#fff'}}>Leave</Text>
              </TouchableOpacity></View> :
              <View style={{margin: 10}}>
                <TouchableOpacity
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
                style={{backgroundColor: colors.secondary, padding: 10, alignSelf: 'center', marginVertical: 10, borderRadius: 5}}>
                <Text style={{color: '#fff'}}>Join</Text>
                </TouchableOpacity>
              </View>}
            <View style={{flexDirection: 'row'}}>
                {gym.vicinity && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5, flex: 1}}>{'Vicinity: '}
                <Text style={{color: colors.secondary}}>{gym.vicinity}</Text>{this.props.location && 
                <Text style={{color: '#999'}}>{' (' + this.getDistance(gym) + ' km away)'}</Text>}</Text>}
                <TouchableOpacity onPress={()=> {
                const { lat, lng } = gym.geometry.location
                const place_id = gym.place_id

                let options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude:  this.props.location.lat,
                  sourceLongitude:   this.props.location.lon,
                  googlePlaceId: place_id, 
                  }
                  this.setState({popUpVisible: true, options})
                }}
                style={{backgroundColor: colors.secondary, padding: 5, paddingVertical: 10, marginHorizontal: 5, borderRadius: 5, height: 40}}>
                <Text style={{color: '#fff'}}>Directions</Text>
                </TouchableOpacity>
            </View>
            {gym.website && <Hyperlink linkDefault={true}>
            <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Website: '}
        <Text style={{color: colors.secondary, textDecorationLine: 'underline'}}>{gym.website}</Text></Text></Hyperlink>}
        {gym.rating && <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{marginLeft: 10, color: '#999'}}>Google rating: </Text>
            <StarRating
            disabled={true}
            containerStyle={{alignSelf: 'center', marginHorizontal: 5}}
            fullStarColor={colors.secondary}
            maxStars={5}
            starSize={20}
            halfStarEnabled={true}
            rating={gym.rating}
            />{gym.user_ratings_total && 
            <Text>{`from ${gym.user_ratings_total} ${gym.user_ratings_total > 1? 'ratings' : 'rating'}`}</Text>}</View>}
        {gym.formatted_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Phone number: '}
        <Text style={{color: colors.secondary}}>{gym.formatted_phone_number}</Text></Text>}
        {gym.international_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Intl phone number: '}
        <Text style={{color: colors.secondary}}>{gym.international_phone_number}</Text></Text>}
        {gym.opening_hours && gym.opening_hours.weekday_text && 
        <View style={{marginHorizontal: 10, marginTop: 10}}>
          <Text style={{color: '#999'}}>Opening Hours:</Text>
          <View style={{marginLeft: 5}}>{this.renderOpeningHours(gym.opening_hours.weekday_text)}</View>
        </View>}
        {gym.types && <Text style={{fontSize: 12, color: '#999', marginVertical: 5, marginLeft: 10}}>{"Tags: " + renderTags(gym.types)}</Text>}
        </ScrollView> 
          <View style={{flexDirection: 'row', backgroundColor: colors.bgColor, paddingVertical: 10}}>
            <TouchableOpacity
            style={{backgroundColor: colors.secondary, flex: 1, paddingVertical: 15, borderRadius: 5, marginLeft: 5, marginRight: 2}}
            onPress={()=> {
              this.props.createSession(gym)
            }}>
              <Text adjustsFontSizeToFit={true}
              style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Session</Text>
            </TouchableOpacity>
            <View style={{borderRightWidth: 1, borderRightColor: 'transparent'}}/>
            <TouchableOpacity
            style={{backgroundColor: colors.secondary, flex: 1, paddingVertical: 15, borderRadius: 5, marginRight: 5, marginLeft: 2}}
            onPress={()=> {
              this.setState({friendsModalOpen: true})
            }}>
              <Text adjustsFontSizeToFit={true}
              style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Private Session</Text>
            </TouchableOpacity>
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
          <FriendsModal location={gym} 
          onClosed={()=> this.setState({friendsModalOpen: false})}
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
  fetchGym: (id) => dispatch(fetchGym(id))
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)