import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  Modal,
  SafeAreaView
} from "react-native"
import {
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Left,
  Title,
  Right,
  ActionSheet,
} from 'native-base'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Image from 'react-native-fast-image'
import  styles  from './styles/profileStyles'
import str from './constants/strings'
import hStyles from './styles/homeStyles'
import colors from './constants/colors'
import ImageViewer from 'react-native-image-zoom-viewer'
import { calculateAge } from './constants/utils'
import Header from './header/header'
import { PulseIndicator } from 'react-native-indicators'
import globalStyles from "./styles/globalStyles"


 class ProfileView extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-person'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.uid = this.params.uid

    this.fetch()

    firebase.database().ref('users/' + this.uid).once('value', user => {
      this.setState({profile: user.val()})
      if (user.val().gym) {
        firebase.database().ref('gyms/' + user.val().gym).once('value', gym => {
          this.setState({gym: gym.val(), loaded: true})
        })
      }
      else this.setState({loaded: true})
      if (this.props.friends[user.val().uid]){
        this.setState({isFriend: true})
      }
    })



    this.user = null
    this.state = {
      isFriend: false,
      profile: {},
      gym: {},
      showImage: false,
      loaded: false
      //avatar: this.props.friends[this.uid] ? this.props.friends[this.uid].avatar : null
    }
  }

  fetch() {
    firebase.storage().ref('images/' + this.uid ).child('backdrop').getDownloadURL()
    .then(backdrop => this.setState({backdrop}))
    .catch(e => console.log(e))

    firebase.storage().ref('images/' + this.uid ).child('avatar').getDownloadURL()
    .then(avatar => this.setState({avatar}))
    .catch(e => console.log(e))
  }

  render () {
    const {  username, first_name, last_name, birthday, email, uid, accountType, activity, level} = this.state.profile
    return (
    <Container>
      <Header 
      hasBack={true}
      title={username || 'Profile'}
      />
        {this.state.loaded ? <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View>
      <View style={{alignItems: 'center', marginBottom: 10}}>
      {this.state.backdrop ? <TouchableOpacity
      style={{height: 150, width: '100%'}}
      onPress={() => {
        this.setState({selectedImage: [{url: this.state.backdrop}], showImage: true})
      }}>
      <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: this.state.backdrop}} />
          </TouchableOpacity> :
          <View style={{height: 150, width: '100%', backgroundColor: colors.primaryLighter, justifyContent: 'center'}}/>}
        {this.state.avatar ?
          <TouchableOpacity 
          onPress={()=> {
            this.setState({selectedImage: [{url: this.state.avatar}], showImage: true})
          }}
          style={[{marginTop: -45, marginHorizontal: 20, borderWidth: 0.5, borderColor: '#fff'}, globalStyles.shadow]}>
            <Image style={{height: 90, width: 90}} source={{uri: this.state.avatar}} />
          </TouchableOpacity>
          : <Icon name='md-contact'
          style={{fontSize: 80, color: colors.primary, marginTop: -45, textAlign: 'center', backgroundColor: '#fff',
          marginBottom: 10, paddingHorizontal: 10, paddingTop: Platform.OS == 'ios' ? 5 : 0, borderWidth: 1, borderColor: colors.secondary}}/>}

      </View>


        <Text style={{alignSelf: 'center', fontSize: 15, textAlign: 'center', fontWeight: 'bold'}}>
        <Text>{username}</Text>
        {(first_name || last_name) &&
          <Text style={{marginLeft: 10, marginVertical: 5}}> ({first_name && 
            <Text>{`${first_name}${last_name ? ' ' : ''}`}</Text>}
            {last_name && <Text>{last_name}</Text>})</Text>}
        </Text>
        {!this.state.isFriend && 
          <TouchableOpacity 
          onPress={()=> {
            Alert.alert(
              'Send pal request',
              'Are you sure?',
              [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Yes', onPress: ()=> {
                this.props.request(this.props.profile.uid ,uid)
                .then(() => {
                  this.props.goBack()
                  Alert.alert('Success', 'Request sent')
                })
                .catch(e => Alert.alert('Error', e.message))
              }, style: 'destructive'},
              ]
              )
          }}
          style={{padding: 10, backgroundColor: colors.secondary, margin: 10, alignSelf: 'center'}}>
          <Text style={{color: '#fff'}}>Send pal request</Text>
          </TouchableOpacity>}



        {accountType && this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Account type:
        <Text style={{color: colors.secondary}}> {accountType}</Text></Text>}

        {this.state.gym && this.state.gym.name && 
          this.state.isFriend && <TouchableOpacity onPress={()=>this.props.goToGym(this.state.gym.place_id)}>
          <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Gym:
        <Text style={{color: colors.secondary}}> {this.state.gym.name}</Text></Text></TouchableOpacity>}

        {birthday && this.state.isFriend &&  <Text style={{marginLeft: 10, marginVertical: 5}}>
       <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Birthday: </Text>
       <Text style={{color: colors.secondary}}>
       {`${this.getFormattedBirthday(birthday)} (${calculateAge(new Date(birthday))})`}</Text></Text>}

        {this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Preferred activity: '}
        <Text style={{color: colors.secondary}}>{activity || 'Unspecified'}</Text></Text>}

        {activity && this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>{'Level: '}
        <Text style={{color: colors.secondary}}>{level || 'Unspecified'}</Text></Text>}
        </View>

          {this.state.isFriend && <TouchableOpacity
          style={{backgroundColor: 'red', padding: 10, alignSelf: 'center', marginBottom: 30}}
          onPress={()=> {
            Alert.alert(
              'Remove pal',
              'Are you sure?',
              [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Yes', onPress: ()=> {
                this.props.remove(uid)
                .then(() => this.props.goBack())
              }, style: 'destructive'},
              ]
              )
          }}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>Remove pal</Text>
          </TouchableOpacity>}
        </View> : <View style={hStyles.spinner}><PulseIndicator color={colors.secondary} /></View>}
        {this.state.spinner && <View style={hStyles.spinner}><PulseIndicator color={colors.secondary}/></View>}
        <Modal onRequestClose={()=> null}
          visible={this.state.showImage} transparent={true}>
        <ImageViewer
          renderIndicator= {(currentIndex, allSize) => null}
          loadingRender={()=> <SafeAreaView><Text style={{color: '#fff', fontSize: 20}}>Loading...</Text></SafeAreaView>}
          renderHeader={()=> {
            return (<TouchableOpacity style={{position: 'absolute', top: 20, left: 10, padding: 10, zIndex: 9999}}
              onPress={()=> this.setState({selectedImage: null, showImage: false})}>
                <View style={{
                  backgroundColor: '#0007',
                  paddingHorizontal: 15,
                  paddingVertical: 2,
                  borderRadius: 10,
                }}>
                  <Icon name={'ios-arrow-back'}  style={{color: '#fff', fontSize: 40}}/>
                </View>
              </TouchableOpacity>)
          }}
          imageUrls={this.state.selectedImage}
            />
      </Modal>
    </Container>
  )
  }

  getFormattedBirthday(date) {
    if (date) {
      let d = new Date(date)
      return `${str.months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`

    }
    else return null
  }



}


import { connect } from 'react-redux'
import { navigateBack, navigateGym } from 'Anyone/js/actions/navigation'
import { deleteFriend, sendRequest } from 'Anyone/js/actions/friends'

const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  remove: (uid) => dispatch(deleteFriend(uid)),
  request: (uid, friendUid) => dispatch(sendRequest(uid, friendUid)),
  goToGym: (gym) => dispatch(navigateGym(gym))
 })

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView)
