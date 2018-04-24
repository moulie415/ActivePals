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
  Left,
  Right
} from 'native-base'
import firebase from "./index"
import VersionNumber from 'react-native-version-number'
import colors from './constants/colors'
import  styles  from './styles/settingsStyles'


 class Settings extends Component {

  static navigationOptions = {
    header: null,
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
      <Left style={{flex: 1}}>
          <TouchableOpacity onPress={() => {
            this.props.goBack()
          } }>
            <Icon name='arrow-back' style={{color: '#fff', padding: 5}} />
          </TouchableOpacity>
          </Left>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir'}}>Settings</Title>
        <Right style={{flex: 1}} />
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


import { connect } from 'react-redux'
import { navigateBack } from 'Anyone/actions/navigation'
//import {  } from 'Anyone/actions/chats'

// const mapStateToProps = ({ friends, profile, chats }) => ({
// })

const mapDispatchToProps = dispatch => ({
  goBack: ()=> dispatch(navigateBack())
})

export default connect(null, mapDispatchToProps)(Settings)
