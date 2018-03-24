import React, { Component } from "react"
import { 
  StyleSheet,
  View,
  TouchableOpacity,
  Alert
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
  Title,
} from 'native-base'
import firebase from "./index"
import VersionNumber from 'react-native-version-number'
import colors from './constants/colors'
import  styles  from './styles/settingsStyles'


 export default class Settings extends Component {
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Settings',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-settings'
        style={{ color: tintColor }}
      />
    ),
  }

  constructor(props) {
    super(props)

    this.user = null
  }

  componentDidMount() {

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    this.user = user
    // User is signed in.
  } else {
    // No user is signed in.
  }
})
}

  render () {
    return (
    <Container style={styles.container}>
      <Header style={{backgroundColor: colors.primary}}>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir'}}>Settings</Title>
      </Header>
      <Content>
        <TouchableOpacity 
        onPress={()=> {
          Alert.alert('coming soon')
          //Linking.openURL('mailto:fitlink-support@gmail.com')
        }}
        style={styles.contact}>
          <Text style={{fontFamily: 'Avenir'}}>Contact Support</Text>
          <Icon name="ios-arrow-forward" style={{color: colors.primary}}/>
        </TouchableOpacity>
        <View>
          <View style={{padding: 10, backgroundColor: '#fff', flexDirection: 'row'}}>
              <Text style={{fontFamily: 'Avenir'}}>Version no: </Text>
              <Text style={{color: colors.primary, fontFamily: 'Avenir', fontWeight: 'bold'}}>{VersionNumber.appVersion}</Text>
          </View>
        </View>
      </Content>
    </Container>
  )
  }
}
