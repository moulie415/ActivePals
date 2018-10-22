import React, { Component } from "react"
import {
  ImageBackground,
  View,
  ScrollView,
  Alert,
  Linking,
} from "react-native"
import {
  Container,
  Icon,
  Header,
  Title
} from "native-base"
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Image from "react-native-fast-image"
import styles from "./styles/notificationsStyles"
import { formatDateTime, dayDiff } from './constants/utils'
import Swipeout from 'react-native-swipeout'
import TouchableOpacity from './constants/TouchableOpacityLockable'
import colors from './constants/colors'


class Notifications extends Component {

  constructor() {
    super()
    this.state = { close: false, spinner: false }
  }
  
  componentDidMount() {

  }

  render() {
    const { } = this.props
    return <Container>
      <Header style={{backgroundColor: colors.primary}}>
        <Title style={{alignSelf: 'center', color: '#fff', fontFamily: 'Avenir', flex: 1}}>Notifications</Title>
      </Header>
      {/*Object.keys(inbox).length > 1 ?
      <ScrollView>
        {this.renderInbox(inbox, onDeleteMessage, brandInfo, onMessagePress)}
      </ScrollView> : <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{textAlign: 'center', color: '#999', fontSize: 20}}>No notifications yet</Text></View>*/}
      { /*this.state.spinner && <View style={styles.indicator}><Spinner color={brandInfo.button}/></View>*/ }
    </Container>
  }

  renderInbox(inbox, onDeleteMessage, brandInfo, onMessagePress) {
    let messages = []
    let index = 0
    let inboxArray = []

    Object.values(inbox).forEach(item => {
      if (typeof item === 'object') {
        inboxArray.push(item)
      }
    })
    let sorted = inboxArray.sort(function(a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    sorted.forEach( item => {
      let swipeoutBtns = [{
        text: 'Delete',
        backgroundColor: 'red',
        onPress: () => {
          this.setState({spinner: true})
          onDeleteMessage(item.id).then(() => {
            this.setState({spinner: false})
          }).catch(e => {
            this.setState({spinner: false})
            Alert.alert("Error", e.message)
          })
          this.setState({close: true})
        }
      }]

      messages.push(
        <Swipeout right={swipeoutBtns} key={index} close={this.state.close}> 
          <TouchableOpacity onPress = {(mutex) => {
            mutex.lockFor(1000)
            if (item.type == 1) {
              onMessagePress(item.title, item.body, this.stringifyDate(new Date(item.timestamp)), item.url)
            }
            else {
              Linking.openURL(item.url).catch(e => {
                Alert.alert("Error", e.message)
              })
            }
          }}>
            <View style={styles.inboxItem}>
              <Icon name={item.type == 1 ? 'ios-mail' : 'ios-notifications'} 
              style={{color: colors.primary, marginRight: 15, marginLeft: 5}}/>
              <View style={{flex: 8}}>
                <Text style={{color: '#000', fontSize: 15}}>{item.title}</Text>
                <Text style={{color: '#999', fontSize: 12}}>{this.stringifyDate(new Date(item.timestamp))}</Text>
              </View>
                <Icon name='ios-arrow-forward' style={{color: '#999', textAlign: 'right', marginRight: 10, flex: 1}}/>
            </View>
          </TouchableOpacity>
        </Swipeout>
      )
      index++
    })
    return messages
  }

  stringifyDate(date) {
    let diff = dayDiff(date, new Date()) - 1
    if (diff == 0) {
      return 'Today'
    }
    else if (diff == 1) {
      return 'Yesterday'
    }
    else {
      return diff + ' days ago'
    }
  }

}

import { connect } from 'react-redux'

const matchStateToProps = ({profile}) => ({
    profile: profile.profile,
})

 const mapDispatchToProps = dispatch => ({
  onDeleteMessage: (id) => console.log(id),
  onNotificationPress: (id) => console.log(id)
 })

export default connect(matchStateToProps, mapDispatchToProps)(Notifications)
