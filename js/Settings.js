import React, { Component } from "react"
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native"
import {
  Container,
  Content,
  Icon,
  Header,
  Title,
  Left,
  Right,
  Spinner,
} from 'native-base'
import firebase from "Anyone/index"
import VersionNumber from 'react-native-version-number'
import colors from './constants/colors'
import  styles  from './styles/settingsStyles'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'


 class Settings extends Component {

  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)

    this.user = null
    this.state = {
      spinner: false,
    }
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
        <Title style={{alignSelf: 'center', color: '#fff'}}>Settings</Title>
        <Right style={{flex: 1}} />
      </Header>
      <Content>
        <TouchableOpacity
        onPress={()=> {
          Alert.alert('coming soon')
          //Linking.openURL('mailto:fitlink-support@gmail.com')
        }}
        style={styles.contact}>
          <Text>Contact Support</Text>
          <Icon name="ios-arrow-forward" style={{color: colors.primary}}/>
        </TouchableOpacity>
          <View style={styles.contact}>
              <Text >Version no: </Text>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>{VersionNumber.appVersion}</Text>
          </View>
          <TouchableOpacity
          style={{padding: 10, backgroundColor: '#fff'}}
          onPress={()=> {
            Alert.alert(
              'Are you sure?',
              'All profile data will be deleted.',
              [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'OK', onPress: () => {
                this.setState({spinner: true})
                this.props.removeUser()
                .then(() => {
                  Alert.alert('Success', 'Account deleted')
                this.setState({spinner: false})
                })
                .catch(e => {
                  Alert.alert('Error', e.message)
                  this.setState({spinner: false})
                })
              }},
              ]
              )
          }}>
              <Text style={{color: 'red'}}>Delete account</Text>
          </TouchableOpacity>
      </Content>
     {this.state.spinner && <View style={styles.spinner}>
      <Spinner color={colors.secondary}/>
      </View>}
    </Container>
  )
  }
}


import { connect } from 'react-redux'
import { navigateBack } from 'Anyone/js/actions/navigation'
import { removeUser } from 'Anyone/js/actions/profile'
//import {  } from 'Anyone/js/actions/chats'

// const mapStateToProps = ({ friends, profile, chats }) => ({
// })

const mapDispatchToProps = dispatch => ({
  goBack: ()=> dispatch(navigateBack()),
  removeUser: ()=> dispatch(removeUser()),
})

export default connect(null, mapDispatchToProps)(Settings)
