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
          <Button style={{backgroundColor: 'transparent', elevation: 0}}>
            <Text>Save</Text>
          </Button>
        </Right>

        </Header>
        
      <View style={{flexDirection: 'row', marginLeft: 20, marginVertical: 20}}>
        <Text style={{color: '#fff'}}>Email: {this.state.email}</Text>
      </View>
      <View style={styles.inputGrp}>
        <Text style={{alignSelf: 'center'}}>Username: </Text>
            <Input
            value={this.state.profile.username}
            onChangeText={u => this.lastName = u}
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
            onChangeText={u => this.lastName = u}
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
            onChangeText={u => this.lastName = u}
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
          placeholder={this.state.profile.birthday}
          maxDate={new Date()}
          customStyles={{
            dateText: {
              color: '#fff',
            },
            dateInput: {
              borderWidth: 0
            }
          }}
          onDateChange={(date) => this.setState({profile: {...this.state.profile, birthday: date}})}
          />
          </View>
      <Button
        onPress={()=> this.logout()}>
        <Text>Log out</Text>
      </Button>
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


  logout() {
    firebase.auth().signOut().then(function() {
    }, function(error) {
      Alert.alert(error.toString())
    })
  }
}
