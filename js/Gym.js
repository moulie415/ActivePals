import React, { Component } from "react"
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  ScrollView
} from "react-native"
import {
  Container,
  Icon,
  Left,
  Title,
  Right,
} from 'native-base'
import { PulseIndicator } from 'react-native-indicators'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Image from 'react-native-fast-image'
import str from './constants/strings'
import hStyles from './styles/homeStyles'
import colors from './constants/colors'
import { Image as SlowImage } from 'react-native'
import { fetchPhotoPath, renderTags, deg2rad  } from './Sessions'
import Hyperlink from 'react-native-hyperlink'
import Header from './header/header'
import StarRating from 'react-native-star-rating'
import { showLocation, Popup } from 'react-native-map-link'
import globalStyles from './styles/globalStyles'



 class Gym extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Gym',
  }

  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.id = this.params.id
    
    fetchGym(this.id).then(gym => {
        this.setState({gym: gym.result, loaded: true})
        fetchPhotoPath(gym.result).then(path => {
            this.setState({photo: path})
        })
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
    return (
    <Container>
    <Header 
    hasBack={true}
     title={'Gym'}
      />
        <View style={{alignItems: 'center', marginBottom: 10}}>
        {this.state.photo ?
      <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: this.state.photo}} /> :
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
        {this.state.loaded ? <ScrollView>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{this.state.gym.name}</Text>
            {this.props.gym && this.props.gym.place_id == this.id ? 
              <View style={{justifyContent: 'space-between', flexDirection: 'row', margin: 10}}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Your active gym</Text>
              <TouchableOpacity 
                  onPress={() => {
                    this.props.onOpenGymChat(this.state.gym.place_id)
                  }}
                  style={{justifyContent: 'center', marginRight: 20}}>
                  <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 40}}/>
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={() => {
                  Alert.alert(
                      'Leave Gym',
                      'Are you sure?',
                      [
                          {text: 'Cancel', style: 'cancel'},
                          {text: 'Yes', onPress: () => this.props.removeGym(), style: 'destructive'}
                      ]
                  )
                  
                  }}
              style={{padding: 5, paddingVertical: 10, alignSelf: 'center', marginBottom: 5, backgroundColor: 'red'}}>
              <Text style={{color: '#fff'}}>Leave Gym</Text>
              </TouchableOpacity></View> :
              <View style={{margin: 10}}>
                <TouchableOpacity
                onPress={()=> {
                    if (this.props.gym) {
                        Alert.alert(
                        'Join Gym',
                        'This will leave your current Gym?',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Yes', onPress: () => this.props.join(this.state.gym)}
                        ]
                    )
                    }
                    else this.props.join(this.state.gym)
                    
                    }}
                style={{backgroundColor: colors.secondary, padding: 10, alignSelf: 'center', marginBottom: 10}}>
                <Text style={{color: '#fff'}}>Join Gym</Text>
                </TouchableOpacity>
              </View>}
              <TouchableOpacity onPress={()=> {
              const { lat, lng } = this.state.gym.geometry.location
              const place_id = this.state.gym.place_id

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
              style={{backgroundColor: colors.secondary, padding: 5, paddingVertical: 10, marginHorizontal: 10, width: 110}}>
              <Text style={{color: '#fff'}}>Get directions</Text>
              </TouchableOpacity>
            {this.state.gym.vicinity && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Vicinity: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.vicinity}</Text>{this.props.location && 
        <Text style={{color: '#999'}}>{' (' + this.getDistance(this.state.gym) + ' km away)'}</Text>}</Text>}
            {this.state.gym.website && <Hyperlink linkDefault={true}>
            <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Website: '}
        <Text style={{color: colors.secondary, textDecorationLine: 'underline'}}>{this.state.gym.website}</Text></Text></Hyperlink>}
        {this.state.gym.rating && <View style={{flexDirection: 'row', marginVertical: 5}}>
              <Text style={{marginLeft: 10, color: '#999'}}>Google rating: </Text>
            <StarRating
            disabled={true}
            containerStyle={{alignSelf: 'center', marginHorizontal: 5}}
            fullStarColor={colors.secondary}
            maxStars={5}
            starSize={20}
            halfStarEnabled={true}
            rating={this.state.gym.rating}
            />{this.state.gym.user_ratings_total && 
            <Text>{`from ${this.state.gym.user_ratings_total} ${this.state.gym.user_ratings_total > 1? 'ratings' : 'rating'}`}</Text>}</View>}
        {this.state.gym.formatted_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Phone number: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.formatted_phone_number}</Text></Text>}
        {this.state.gym.international_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Intl phone number: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.international_phone_number}</Text></Text>}
        {this.state.gym.opening_hours && this.state.gym.opening_hours.weekday_text && 
        <View style={{marginHorizontal: 10, marginTop: 10}}>
          <Text style={{color: '#999'}}>Opening Hours:</Text>
          <View style={{marginLeft: 5}}>{this.renderOpeningHours(this.state.gym.opening_hours.weekday_text)}</View>
        </View>}
        {this.state.gym.types && <Text style={{fontSize: 12, color: '#999', marginVertical: 5, marginLeft: 10}}>{"Tags: " + renderTags(this.state.gym.types)}</Text>}
        </ScrollView> : <View style={hStyles.spinner}><PulseIndicator color={colors.secondary} /></View>}
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
    </Container>
  )
  }
  getDistance(item) {
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

  renderOpeningHours(hours) {
    let text = []
    hours.forEach(hour => {
      text.push(<Text key={hour} style={{marginVertical: 5, color: colors.secondary}}>{hour}</Text>)
    })
    return text
  }


}

const fetchGym = (id) => {
    let url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${str.googleApiKey}`
    return fetch(url).then(response => {
      return response.json()
    })
  }


import { connect } from 'react-redux'
import { navigateBack, navigateGymMessaging } from 'Anyone/js/actions/navigation'
import { removeGym, joinGym } from './actions/profile'


const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  location: profile.location
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  join: (location) => dispatch(joinGym(location)),
  removeGym: () => dispatch(removeGym()),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)