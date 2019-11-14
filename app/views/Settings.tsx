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
} from 'native-base'
import firebase from 'react-native-firebase'
import VersionNumber from 'react-native-version-number'
import colors from '../constants/colors'
import  styles  from '../styles/settingsStyles'
import Text, { globalTextStyle } from '../components/Text'
import Header from '../components/Header/header'
import { PulseIndicator } from 'react-native-indicators'
import FbFriendsModal from '../components/FbFriendsModal'
import DialogInput from 'react-native-dialog-input'

 class Settings extends Component {

  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)

    this.user = null
    this.state = {
      spinner: false,
      showDialog: false,
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
      <Header 
      hasBack={true}
       title={'Settings'}
        />
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
        <TouchableOpacity
        onPress={()=> {
          this.props.viewWelcome(true)
        }}
        style={styles.contact}>
          <Text>View Welcome Swiper</Text>
          <Icon name="ios-arrow-forward" style={{color: colors.primary}}/>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={()=> {
          this.props.viewCredits()
        }}
        style={styles.contact}>
          <Text>Credits</Text>
          <Icon name="ios-arrow-forward" style={{color: colors.primary}}/>
        </TouchableOpacity>
        {this.props.profile.fb_login && <TouchableOpacity
        onPress={()=> {
            this.props.profile.username? this.setState({fbModalOpen: true}) : Alert.alert("Please set a username before trying to add a pal")
        }}
        style={styles.contact}>
          <Text>Import Facebook friends</Text>
          <Icon name="ios-arrow-forward" style={{color: colors.primary}}/>
        </TouchableOpacity>}
          <View style={styles.contact}>
              <Text >Version no: </Text>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>{VersionNumber.appVersion}</Text>
          </View>
          <TouchableOpacity
          style={{padding: 10, backgroundColor: '#fff'}}
          onPress={()=> this.setState({showDialog: true})}>
              <Text style={{color: 'red'}}>Delete account</Text>
          </TouchableOpacity>
      </Content>
     {this.state.spinner && <View style={styles.spinner}>
      <PulseIndicator color={colors.secondary}/>
      </View>}
      <FbFriendsModal 
        isOpen={this.state.fbModalOpen} 
        onClosed={() => this.setState({fbModalOpen: false})}
        />
        <DialogInput isDialogVisible={this.state.showDialog}
            title={"Enter email to confirm"}
            message={"All your data will be deleted."}
            hintInput ={"Enter email"}
            submitInput={ async (inputText) => {
              if (inputText == this.props.profile.email) {
                this.setState({spinner: true})
                try {
                  await this.props.removeUser()
                  Alert.alert('Success', 'Account deleted')
                  this.setState({spinner: false})
                } catch(e) {
                  Alert.alert('Error', e.message)
                  this.setState({spinner: false})
                }
              }
              else Alert.alert('Incorrect email')
             }}
            closeDialog={ () => this.setState({showDialog: false})}
            />
    </Container>
  )
  }
}


import { connect } from 'react-redux'
import {
  navigateBack,
  navigateWelcome,
  navigateCredits
} from '../actions/navigation'
import { removeUser } from '../actions/profile'

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile
})


const mapDispatchToProps = dispatch => ({
  goBack: ()=> dispatch(navigateBack()),
  removeUser: ()=> dispatch(removeUser()),
  viewWelcome: (goBack)=> dispatch(navigateWelcome(goBack)),
  viewCredits: () => dispatch(navigateCredits())

})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
