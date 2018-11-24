import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert
} from 'react-native'
import {
  Icon,
  Input
} from 'native-base'
import Swiper from 'react-native-swiper'
import styles from './styles/welcomeStyles'
import colors from './constants/colors'
import Text from './constants/Text'
import str from './constants/strings'
import { getResource } from './constants/utils'
import firebase from 'react-native-firebase'


class Welcome extends Component {
    constructor(props) {
        super(props)
        this.params = this.props.navigation.state.params

        this.state = {
          username: this.props.profile.username
        }
        
    }
    render() {
        return (
            <Swiper
            style={styles.wrapper}
            showsButtons={true}
            loop={false}
            activeDotColor={colors.secondary}
            nextButton={<Text style={styles.buttonText}>›</Text>}
            prevButton={<Text style={styles.buttonText}>‹</Text>}
            >
              <View style={styles.slide1}>
                {this.skip()}
                <Text style={styles.text}>{'Welcome \n to \n' + str.appName}</Text>
                <Image 
                style={{tintColor: '#fff', width: 100, height: 100}} 
                source={require('Anyone/assets/images/logo.png')} />
              </View>
              <View style={styles.slide2}>
              {this.skip()}
                <Text style={styles.text}>Create and join sessions with people in your area</Text>
                {this.renderImages()}
                <Text style={styles.text}>Or create private sessions for you and your buddies</Text>
                <Icon name="ios-lock" style={{color: '#fff', fontSize: 50}} />
              </View>
              <View style={styles.slide2}>
              {this.skip()}
                <Text style={styles.text}>Search for and join your local Gym</Text>
                <Image
                  style={{tintColor: '#fff', height: 50, width: 50, margin: 10}}
                  source={getResource('Gym')}/>
                <Text style={styles.text}>{'Are you a personal trainer? \nWhy not get verified? \n(coming soon)'}</Text>
                <Image
                source={require('../assets/images/muscle.png')}
                style={{tintColor: '#fff', height: 50, width: 50, margin: 10}} />
              </View>
              <View style={styles.slide2}>
              {this.skip()}
                <Text style={styles.text}>Participate in chats with your buddies, in sessions and with members of your gym!!</Text>
                <Icon name="md-chatboxes" style={{color: '#fff', fontSize: 50}} />
              </View>
              <View style={styles.slide3}>
                <Text style={styles.text}>Make sure to set a username</Text>
                <TextInput
                  value={this.state.username}
                  onChangeText={username => this.setState({username})}
                  style={{
                    backgroundColor: '#fff',
                    color: colors.secondary,
                    padding: 5,
                    fontSize: 20,
                    marginBottom: 20,
                    paddingHorizontal: 10,
                    width: 250,
                    textAlign: 'center'
                    }}
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  />

                <TouchableOpacity 
                style={{backgroundColor: colors.secondary, padding: 10}}
                onPress={()=> {
                  if (this.state.username && this.state.username == this.props.profile.username) {
                    this.nav()
                  }
                  else if (!this.state.username) {
                    Alert.alert('Sorry', 'Please set a username before continuing')
                  }
                  else {
                    firebase.database().ref('users/' + this.props.profile.uid).child('username').set(this.state.username)
                      .then(() => {
                        this.nav()
                        Alert.alert('Success', 'Username saved')
                      })
                      .catch(e => {
                        Alert.alert('Error', 'That username may have already been taken')
                      })
                  }
                }}>
                    <Text style={{color: '#fff', fontSize: 20, paddingHorizontal: 10}}>Finish</Text>
                </TouchableOpacity>
              </View>
            </Swiper>
          )
    }
    nav() {
      this.params && this.params.goBack ? this.props.goBack() : this.props.goHome()
    }
    skip() {
      return <SafeAreaView style={{padding: 10, position: 'absolute', top: 5, right: 10}}>
      <TouchableOpacity 
      onPress={()=> this.nav()}
      >
      <Text style={{color: '#fff', fontSize: 20}}>Skip</Text>
      </TouchableOpacity>
      </SafeAreaView>
    }

    renderImages() {
      let images = []
      let types = ['Gym', 'Running', 'Cycling', 'Swimming']
      types.forEach(type => {
        images.push(
          <Image
          key={type}
          style={{tintColor: '#fff', height: 50, width: 50, margin: 10}}
          source={getResource(type)}/>
        )
      })
      return <View style={{flexDirection: 'row'}}>{images}</View>
    }
}


import { connect } from 'react-redux'
import { navigateBack, navigateHome } from 'Anyone/js/actions/navigation'
import { doSetup, fetchProfile, setHasLoggedIn, setLoggedOut } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ profile }) => ({
  profile: profile.profile
})

const mapDispatchToProps = dispatch => ({
 goHome: ()=> dispatch(navigateHome()),
 goBack: ()=> dispatch(navigateBack())
})

export default connect(mapStateToProps, mapDispatchToProps)(Welcome)