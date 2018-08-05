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

    firebase.database().ref('users/' + this.uid).once('value', user => {
      this.setState({profile: user.val()})
      if (this.props.friends[user.val().uid]){
        this.setState({isFriend: true})
      }
    })

    this.user = null
    this.state = {
      isFriend: false,
      profile: {}
    }
  }


  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
  }


  render () {
    const {  username, first_name, last_name, birthday, email, uid, accountType } = this.state.profile
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
      <View style={{alignItems: 'center', marginVertical: 10}}>
        {this.state.avatar ?
            <Image style={{height: 90, width: 90, borderRadius: 5, marginHorizontal: 20}}
            source={{uri: this.state.avatar}} />
          : <Icon name='md-contact'
          style={{fontSize: 80, color: colors.primary, textAlign: 'center',
          marginBottom: Platform.OS == 'ios' ? -5 : null, marginHorizontal: 20}}/>}

      </View>


        <Text style={{alignSelf: 'center', fontSize: 15, textAlign: 'center', fontWeight: 'bold'}}>
        <Text>{username}</Text>
        {(first_name || last_name) &&
          <Text style={{marginLeft: 10, marginVertical: 5}}> ({first_name && 
            <Text>{`${first_name}${last_name ? ' ' : ''}`}</Text>}
            {last_name && <Text>{last_name}</Text>})</Text>}
        </Text>
        <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Email: <Text style={{color: colors.secondary}}>{email}</Text></Text>
        {accountType && <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Account type:
        <Text style={{color: colors.secondary}}> {accountType}</Text></Text>}
        {birthday && <Text style={{marginLeft: 10, marginVertical: 5}}>
       <Text style={{color: '#999', marginLeft: 10, marginVertical: 5}}>Birthday: </Text>
       <Text style={{color: colors.secondary}}>
       {`${this.getFormattedBirthday(birthday)} (${calculateAge(new Date(birthday))})`}</Text></Text>}
        </View>

          {this.state.isFriend && <TouchableOpacity
          style={{backgroundColor: 'red', padding: 10, alignSelf: 'center', marginBottom: 30}}
          onPress={()=> {
            Alert.alert(
              'Delete Buddy',
              'Are you sure?',
              [
              {text: 'Cancel', style: 'cancel'},
              {text: 'Yes', onPress: ()=> this.remove(uid), style: 'destructive'}
              ]
              )
          }}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>Delete friend</Text>
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
import { navigateLogin, navigateSettings, navigateBack } from 'Anyone/js/actions/navigation'
import { fetchProfile, setLoggedOut } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ friends, sharedInfo }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
})

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView)
