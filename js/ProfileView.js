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
import hStyles from './styles/homeStyles'
import colors from './constants/colors'


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
    this.isFriend = false

    if (this.props.friends[this.uid]) {
      this.profile = this.props.friends[this.uid]
      this.isFriend = true
    }
    else if (this.props.users[this.uid]) {
      this.profile = this.props.users[this.uid]
    }
    else {
      firebase.database().ref('users/' + this.uid).once('value', user => {
        this.profile = user.val()
      })
    }

    this.user = null
    this.state = {
    }
  }


  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
  }


  render () {
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
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>Profile</Title>
        <Right/>

        </Header>
        <ScrollView>
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
        {this.state.avatar ?
            <Image style={{height: 90, width: 90, borderRadius: 5, marginHorizontal: 20}}
            source={{uri: this.state.avatar}} />
          : <Icon name='md-contact'
          style={{fontSize: 80, color: colors.primary, textAlign: 'center',
          marginBottom: Platform.OS == 'ios' ? -5 : null, marginHorizontal: 20}}/>}
        <View style={{flex: 1, marginRight: 10}}>
            <Text style={{color: '#999'}}>Email: <Text style={{color: colors.secondary}}>{this.profile && this.profile.email}</Text></Text>
            <Text style={{color: '#999'}}>Account type: <Text style={{color: colors.secondary}}>
            {this.state.profile && this.state.profile.accountType}</Text></Text>
        </View>

      </View>


      <View style={styles.inputGrp}>
        <Text style={{alignSelf: 'center'}}>Username: </Text>
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>First name: </Text>
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Last name: </Text>
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Birthday: </Text>
          </View>
        {this.state.spinner && <View style={hStyles.spinner}><Spinner color={colors.secondary}/></View>}
          <TouchableOpacity
          style={{backgroundColor: 'red', padding: 10, alignSelf: 'center', marginBottom: 10}}
          onPress={()=> {
            Alert.alert(
              "Delete friend",
              "Are you sure?",
              [
              {text: "Cancel", style: 'cancel'},
              {text: "Yes", onPress: ()=> this.remove(this.state.selectedUser.uid), style: 'destructive'}
              ]
              )
          }}>
          <Text style={{fontFamily: 'Avenir', color: '#fff'}}>Delete friend</Text>
          </TouchableOpacity>
        </ScrollView>

    </Container>
  )
  }

  getDate(date) {
    if (date) {
      let formatted = date.replace(/-/g, "/")
      return new Date(formatted)
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
