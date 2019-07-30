import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  Platform
} from 'react-native'
import {
  Container,
  Icon
} from 'native-base'
import Header from '../components/Header/header'
import firebase from 'react-native-firebase'
import Text from '../components/Text'
import colors from '../constants/colors'
import { PulseIndicator } from 'react-native-indicators'
import { getType, formatDateTime } from '../constants/utils'
import Image from 'react-native-fast-image'
import globalStyles from '../styles/globalStyles'
import styles from '../styles/sessionStyles'

class SessionInfo extends Component {
  constructor(props) {
    super(props)
    this.params = this.props.navigation.state.params
    this.sessionId = this.params.sessionId
    this.state = {
      session: null
    }
  }
  async componentDidMount() {
    const session = await firebase.database().ref('sessions').child(this.sessionId).once('value')
    let host
    const sessionHost = session.val().host
    if (sessionHost == this.props.profile.uid) {
      host = this.props.profile
    }
    else if (this.props.friends[sessionHost]) {
      host = this.props.friends[sessionHost]
    }
    else if (this.props.users[sessionHost]) {
      host = this.props.users[sessionHost]
    }
    else {
      const user = await firebase.database().ref('users').child(sessionHost)
      host = user.val()
    }

    this.setState({session: session.val(), host})
  }

  render() {
    return <Container style={{flex: 1, backgroundColor: '#9993'}}>
    <Header 
    hasBack={true}
    title={this.state.session ? this.state.session.title : ''}
    />
      {this.state.session ? 
      <View>
        <View style={{alignItems: 'center', marginVertical: 15}}>
          {getType(this.state.session.type, 50)}
        </View>
      <View style={{backgroundColor: '#fff', ...globalStyles.bubbleShadow}}>
        <View style={{padding: 10, justifyContent: 'center', marginVertical: 5}}>
          {this.renderInfoHeader('Details')}
          <Text style={{color: '#999'}}>{this.state.session.details}</Text>
        </View>
        <View style={styles.infoRowContainer}>
          {this.renderInfoHeader('Date')}
          <Text style={{color: '#999'}}>{(formatDateTime(this.state.session.dateTime))
              + " for " + (this.state.session.duration) + " " +
              (this.state.session.duration > 1 ? 'hours' : 'hour') }</Text>
        </View>
        <View style={styles.infoRowContainer}>
          {this.renderInfoHeader('Location')}
          <Text style={{color: '#999'}}>{this.state.session.location.formattedAddress}</Text>
        </View>
        <TouchableOpacity 
        onPress={() => {
              if (this.state.host.uid == this.props.profile.uid) {
                this.props.goToProfile()
              }
              else this.props.viewProfile(this.state.host.uid)
            }}
        style={[styles.infoRowContainer, {flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}]}>
          {this.renderInfoHeader('Host')}
          {this.state.host && <View
            style={{flexDirection: 'row', alignItems: 'center', marginVertical: 5}}
            >
            {this.state.host.avatar? <Image source={{uri: this.state.host.avatar}} style={{height: 40, width: 40, borderRadius: 25}}/> :
              <Icon name='md-contact'  style={{fontSize: 50, color: colors.primary, marginTop: Platform.OS == 'ios' ? -10 : 0}}/>}
              <Text style={{marginHorizontal: 10}}>{this.state.host.username}</Text>
          </View>}
          </TouchableOpacity>
          </View>
      </View> : 
      <PulseIndicator color={colors.secondary} />}
    </Container>
  }

  renderInfoHeader(text) {
    return <Text style={{fontSize: 18}}>{text}</Text>
  }

}

import { connect } from 'react-redux'
import {
  navigateProfileView
} from '../actions/navigation'

const mapStateToProps = ({ profile, sharedInfo, friends }) => ({
  profile: profile.profile,
  users: sharedInfo.users,
  friends: friends.friends
})

const mapDispatchToProps = dispatch => ({
  viewProfile: (uid) => dispatch(navigateProfileView(uid))
})

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfo)