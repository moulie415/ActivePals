import React, { Component } from "react"
import { 
  StyleSheet,
  Alert,
  View,
  TouchableOpacity
} from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content, 
  Item,
  Icon,
  Header,
  Left,
  Title,
  Right
} from 'native-base'
import firebase from './index'
import  styles  from './styles/loginStyles'
import colors from './constants/colors'
import DatePicker from 'react-native-datepicker'

 export default class Profile extends Component {
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

    this.database = firebase.database().ref('users')
    this.user = null
    this.state = {
      email: "",
      profile: {},
    }
  }


  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        this.props.navigation.navigate('Login')
      }
      else {
        this.user = user
        this.setState({email: user.email })
        this.listenForUserChanges(firebase.database().ref('users/' + user.uid))

      }
    })  
  }

  listenForUserChanges(ref) {
    ref.on("value", snapshot => {
      profile = snapshot.val()
      this.initialProfile = profile
      this.setState({profile})
    })

  }


  render () {
    return (
    <Container style={{backgroundColor: colors.primary}}>
    <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}} />
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>Profile</Title>
        <Right>
          <Button onPress={()=> this.updateUser(this.initialProfile, this.state.profile)}
          style={{backgroundColor: 'transparent', elevation: 0}}>
            <Text>Save</Text>
          </Button>
        </Right>

        </Header>
        
      <View style={{flexDirection: 'row', marginLeft: 20, marginVertical: 20}}>
        <Text style={{color: '#fff'}}>Email: {this.state.email}</Text>
      </View>
      <View style={{flexDirection: 'row', marginLeft: 20, marginBottom: 20}}>
        <Text style={{color: '#fff'}}>Account type: {this.state.profile.accountType}</Text>
      </View>
      <View style={styles.inputGrp}>
        <Text style={{alignSelf: 'center'}}>Username: </Text>
            <Input
            value={this.state.profile.username}
            onChangeText={username => this.setState({profile: {...this.state.profile, username}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>First name: </Text>
            <Input
            value={this.state.profile.first_name}
            onChangeText={name => this.setState({profile: {...this.state.profile, first_name: name}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Last name: </Text>
            <Input
            value={this.state.profile.last_name}
            onChangeText={name => this.setState({profile: {...this.state.profile, last_name: name}})}
            placeholderTextColor="#fff"
            style={styles.input}
            autoCapitalize={'none'}
            autoCorrect={false}
        />
          </View>
          <View style={styles.inputGrp}>
            <Text style={{alignSelf: 'center'}}>Birthday: </Text>
          <DatePicker
          date={this.getDate(this.state.profile.birthday)}
          placeholder={this.state.profile.birthday || 'None'}
          maxDate={new Date()}
          confirmBtnText={'Confirm'}
          cancelBtnText={'Cancel'}
          customStyles={{
            dateText: {
              color: '#fff',
            },
            placeholderText: {
              color: '#fff'
            },
            dateInput: {
              borderWidth: 0
            }
          }}
          onDateChange={(date) => this.setState({profile: {...this.state.profile, birthday: date}})}
          />
          </View>
      <TouchableOpacity
        style={{backgroundColor: colors.secondary, marginLeft: 20, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20}}
        onPress={()=> this.logout()}>
        <Text style={{color: '#fff', fontFamily: 'Avenir'}} >Log out</Text>
      </TouchableOpacity>
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
  
updateUser(initial, profile) {
  if (JSON.stringify(initial) === JSON.stringify(profile)) {
    Alert.alert("No changes")
  }  
  else {
      if (profile.username.length < 5) {
        Alert.alert('Sorry', 'Username must be at least 5 characters long')
      }
      else {
      firebase.database().ref('users/' + this.user.uid).set({...profile})
      .then(()=> {
        initial.username && firebase.database().ref('usernames').child(initial.username).remove()
        firebase.database().ref('usernames').child(profile.username).set(profile.uid)
        .then(() => Alert.alert("Success", 'Profile saved'))
        .catch(e => Alert.alert("Error", e.message))
      })
      .catch(e => Alert.alert('Error', e.message + "\nthat username may have already been taken"))
      }
    }

}

 

  logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
      Alert.alert(error.toString())
    })
  }
}
