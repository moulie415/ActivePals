import React, { Component } from "react"
import {
  Alert,
  View,
  TouchableOpacity,
  Platform
} from "react-native"
import {
  Container,
  Icon,
  Header,
  Left,
  Title,
  Right,
  Spinner
} from 'native-base'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Image from 'react-native-fast-image'
import str from './constants/strings'
import hStyles from './styles/homeStyles'
import colors from './constants/colors'
import { Image as SlowImage } from 'react-native'
import { fetchPhotoPath } from './Sessions'
import Hyperlink from 'react-native-hyperlink'
import { showLocation } from 'react-native-map-link'
import { deg2rad } from './Sessions'



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
      //avatar: this.props.friends[this.uid] ? this.props.friends[this.uid].avatar : null
    }
  }

  render () {
    return (
    <Container>
    <Header style={{backgroundColor: colors.primary}}>
    <Left>
          <TouchableOpacity onPress={() => {
            this.props.goBack()
          } }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Title style={{alignSelf: 'center', color: '#fff', maxWidth: 250}}>{'Gym'}</Title>
        <Right/>
        </Header>
        <View style={{alignItems: 'center', marginBottom: 10}}>
        {this.state.photo ?
      <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: this.state.photo}} /> :
          <View style={{height: 150, width: '100%', backgroundColor: colors.primaryLighter, justifyContent: 'center'}}/>}
          {<SlowImage 
            style={{width: 80,
            padding: 10,
            height: 80,
            tintColor: colors.secondary,
            marginTop: -40,
            borderWidth: 1,
            borderColor: colors.secondary,
            backgroundColor: '#fff'}}
            source={require('Anyone/assets/images/dumbbell.png')}/>}
          </View>
        {this.state.loaded ? <View>
            <Text style={{alignSelf: 'center', fontWeight: 'bold'}}>{this.state.gym.name}</Text>
            {this.props.gym && this.props.gym.place_id == this.id ? 
              <View style={{justifyContent: 'space-between', flexDirection: 'row', margin: 10}}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Currently your active gym</Text>
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
            {this.state.gym.vicinity && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Vicinity: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.vicinity}</Text>{this.props.location && 
        <Text style={{color: '#999'}}>{' (' + this.getDistance(this.state.gym) + ' km away)'}</Text>}</Text>}
            {this.state.gym.website && <Hyperlink linkDefault={true}>
            <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Website: '}
        <Text style={{color: colors.secondary, textDecorationLine: 'underline'}}>{this.state.gym.website}</Text></Text></Hyperlink>}
        {this.state.gym.formatted_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Phone number: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.formatted_phone_number}</Text></Text>}
        {this.state.gym.international_phone_number && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Intl phone number: '}
        <Text style={{color: colors.secondary}}>{this.state.gym.international_phone_number}</Text></Text>}
        </View> : <View style={hStyles.spinner}><Spinner color={colors.secondary} /></View>}
        {this.state.spinner && <View style={hStyles.spinner}><Spinner color={colors.secondary}/></View>}

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


}

const fetchGym = (id) => {
    let url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${str.googleApiKey}`
    return fetch(url).then(response => {
      return response.json()
    })
  }


import { connect } from 'react-redux'
import { navigateBack } from 'Anyone/js/actions/navigation'
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
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)