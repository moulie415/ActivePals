import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView
} from "react-native"
import {
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Header,
  Left,
  Title,
  Right,
  ActionSheet,
  Spinner
} from 'native-base'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import  styles  from './styles/profileStyles'
import str from './constants/strings'
import hStyles from './styles/homeStyles'
import colors from './constants/colors'
import { calculateAge } from './constants/utils'


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
          this.setState({gym: gym.val()})
        })
      }
      if (this.props.friends[user.val().uid]){
        this.setState({isFriend: true})
      }
    })



    this.user = null
    this.state = {
      isFriend: false,
      profile: {},
      gym: {}
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


  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
  }


  render () {
    const {  username, first_name, last_name, birthday, email, uid, accountType, activity, level} = this.state.profile
    return (
    <Container>
    <Header style={{backgroundColor: colors.primary}}>
    <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
            this.props.goBack()
          } }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>{username || 'Profile'}</Title>
        <Right/>

        </Header>
        <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View>
      <View style={{alignItems: 'center', marginBottom: 10}}>
      {this.state.backdrop ? <Image style={{height: 150, width: '100%'}}
          resizeMode='cover'
          source={{uri: this.state.backdrop}} /> :
          <View style={{height: 150, width: '100%', backgroundColor: colors.primaryLighter, justifyContent: 'center'}}/>}
        {this.state.avatar ?
            <Image style={{height: 90, width: 90, marginTop: -45, marginHorizontal: 20, borderWidth: 0.5, borderColor: '#fff'}}
            source={{uri: this.state.avatar}} />
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
              'Send Buddy request',
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
          <Text style={{color: '#fff'}}>Send Buddy request</Text>
          </TouchableOpacity>}


        {this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Email: <Text style={{color: colors.secondary}}>{email}</Text></Text>}

        {accountType && this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Account type:
        <Text style={{color: colors.secondary}}> {accountType}</Text></Text>}

        {this.state.gym && this.state.gym.name && 
          this.state.isFriend && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Gym:
        <Text style={{color: colors.secondary}}> {this.state.gym.name}</Text></Text>}

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
              'Remove Buddy',
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
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>Remove Buddy</Text>
          </TouchableOpacity>}
        </View>
        {this.state.spinner && <View style={hStyles.spinner}><Spinner color={colors.secondary}/></View>}

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
import { navigateBack } from 'Anyone/js/actions/navigation'
import { deleteFriend, sendRequest } from 'Anyone/js/actions/friends'

const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  remove: (uid) => dispatch(deleteFriend(uid)),
  request: (uid, friendUid) => dispatch(sendRequest(uid, friendUid))
 })

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView)
