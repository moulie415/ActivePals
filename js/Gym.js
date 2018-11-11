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
      loaded: false
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
        {this.state.loaded ? <View style={{flex: 1, justifyContent: 'space-between'}}>
        </View> : <View style={hStyles.spinner}><Spinner color={colors.secondary} /></View>}
        {this.state.spinner && <View style={hStyles.spinner}><Spinner color={colors.secondary}/></View>}

    </Container>
  )
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


const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
 })

export default connect(mapStateToProps, mapDispatchToProps)(Gym)