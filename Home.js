import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ScrollView,
  Linking
} from "react-native"
import {
  Button,
  Text,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Spinner,
  Switch,
  Header,
  Card,
  ActionSheet,
  Left,
  Right,
  Title,
} from 'native-base'
import firebase from "./index"
import Permissions from 'react-native-permissions'
import styles from './styles/homeStyles'
import colors from './constants/colors'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import { getType } from './constants/utils'
import Hyperlink from 'react-native-hyperlink'

 class Home extends Component {

 static navigationOptions = {
    header: null,
    tabBarLabel: 'Home',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='md-home'
        style={{ color: tintColor }}
      />
    ),
  }
  constructor(props) {
    super(props)
    this.nav = this.props.navigation

    this.user = null
    this.sessionsRef = firebase.database().ref('sessions')
    this.state = {
      username: 'no username',
      spinner: false,
      showMap: true,
      switch: false,
      sessions: [],
      refreshing: false,
      selectedFriends: []
    }
  }

  componentDidMount() {


    firebase.auth().onAuthStateChanged( user => {
      if (user) {
        this.user = user
      }
    })

    Permissions.check('location').then(response => {
      this.setState({spinner: true})
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ locationPermission: response })
      if (response != "authorized") {
        this.alertForLocationPermission()
      }
      else {
        this.getPosition()
      }
    })

    this.listenForSessions(this.sessionsRef)



  }

  listenForSessions(ref) {
    ref.on('value', snapshot => {
      let sessions = []
      let index = 1
      snapshot.forEach(child => {
        let duration = child.val().duration*60*60*1000
        let time = new Date(child.val().dateTime.replace(/-/g, "/")).getTime()
        let current = new Date().getTime()
        if (time + duration > current) {
          let inProgress = time < current
          let users = Object.keys(child.val().users)
          if (!child.val().private || users.some(user => user == this.props.profile.uid) ) {
            sessions.push({...child.val(), key: child.key, inProgress})
            index++
          }
        }
        else {
          //validate time serverside before deleting session in case clients time is wrong
          firebase.database().ref('timestamp').set(firebase.database.ServerValue.TIMESTAMP)
          .then(()=> {
            firebase.database().ref('timestamp').once('value', snapshot => {
              if (snapshot.val() > time + duration) {
                firebase.database().ref('sessions').child(child.key).remove()
                firebase.database().ref('sessionChats').child(child.key).remove()
                .then(() => this.props.onLeave(child.key, this.props.chats))
              }
            })
          })
        }
      })
      let sorted = sessions.sort(function(a, b) {
        let aDate = a.dateTime.replace(/-/g, "/")
        let bDate = b.dateTime.replace(/-/g, "/")
        return new Date(aDate) - new Date(bDate)
      })
      this.setState({sessions: sorted, refreshing: false})
    })
  }




  render () {
    //switch for list view and map view
    //action sheet when pressing 
    return (
      <Container style={styles.container}>

      {this.state.spinner && <Spinner style={styles.spinner} />}
        <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}} />
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff', fontFamily: 'Avenir'}}>Sessions</Title>
        <Right>
           <View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1}}> 
            <Text style={{color: '#fff', fontFamily: 'Avenir'}}>Map: </Text>
            <Switch value={this.state.switch} onValueChange={(val)=> this.setState({switch: val})} />
          </View>
        </Right>

        </Header>
       

        {!this.state.switch && this.getSessions(this.state.sessions)}

        {this.state.switch && this.state.showMap && <MapView
          style={styles.map}
          onPress={(event)=> this.handlePress(event)}
          showsUserLocation={true}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}

        >
        {this.markers(this.state.sessions)}
        </MapView>}

        <View style={{flexDirection: 'row'}}>
          <Button style={[styles.button]}
          onPress={()=> this.props.onContinue(null)}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center', fontFamily: 'Avenir'}}>Create Session</Text>
          </Button>
          <View style={{borderRightWidth: 1, borderRightColor: '#fff'}}/> 
          <Button style={styles.button}
          onPress={()=> {
            if (this.props.friends.length > 0) {
              this.refs.friendsModal.open()
            }
            else {
              Alert.alert("Sorry", "You must have at least one buddy to create a private session")
            }
          }}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center', fontFamily: 'Avenir'}}>Create Private Session</Text>
          </Button>
        </View>
        <Modal style={styles.modal} position={"center"} ref={"modal"} isDisabled={this.state.isDisabled}>
        {this.state.selectedSession && <View style={{margin: 10, flex: 1}}>
          <ScrollView>
          <Text style={{fontFamily: 'Avenir', fontWeight: 'bold', marginVertical: 5}}>{this.state.selectedSession.title}</Text>
          <Hyperlink 
          linkStyle={{color: colors.secondary}}
          linkDefault={ true }>
            <Text style={{fontFamily: 'Avenir', marginVertical: 5}}>{this.state.selectedSession.details}</Text>
          </Hyperlink>
          <Text style={{fontFamily: 'Avenir', marginVertical: 5}}>{(this.formatDateTime(this.state.selectedSession.dateTime))
            + " for " + (this.state.selectedSession.duration) + " " +
            (this.state.selectedSession.duration > 1? 'hours' : 'hour') }</Text>
            <Text style={{fontFamily: 'Avenir', marginVertical: 5}}>{this.state.selectedSession.location.formattedAddress}</Text>
            <TouchableOpacity onPress={()=> this.getPosition(true)}
            style={{marginVertical: 5}}>
              <Text style={{color: colors.secondary, fontFamily: 'Avenir'}}>Get directions</Text>
            </TouchableOpacity>
            </ScrollView>
             {<View style={{justifyContent: 'flex-end', flex: 1}}>{this.fetchButtons(this.state.selectedSession, this.user.uid)}</View>} 
            </View>}

        </Modal>
        <Modal style={styles.modal} position={"center"} ref={"friendsModal"} >
          <Text style={{fontSize: 20, textAlign: 'center', fontFamily: 'Avenir', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          Select buddies</Text>
          <ScrollView style={{backgroundColor: '#d6d6d6'}}>
          {this.renderFriendsSelection()}
          </ScrollView>
          <View style={{backgroundColor: colors.primary}}>
            <TouchableOpacity onPress={()=> {
              if (this.state.selectedFriends.length > 0) {
                this.props.onContinue(this.state.selectedFriends)
              }
              else {
                Alert.alert("Sorry", "Please select at least one buddy")
              }
            }}
            style={{padding: 5}}>
              <Text style={{color: '#fff', backgroundColor: colors.secondary, alignSelf: 'center', padding: 5, paddingHorizontal: 10}}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Container>
      )
  }

  renderFriendsSelection() {
    let friends = []
    this.props.friends.forEach((friend, index) => {
      let selected = this.state.selectedFriends.some(uid => uid == friend.uid)
      friends.push(
          <TouchableOpacity key={index} onPress={()=> this.onFriendPress(friend.uid)}>
          <View style={{backgroundColor: '#fff', marginBottom: 1, paddingVertical: 15, paddingHorizontal: 10, marginBottom: 0.5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {friend.avatar? <Image source={{uri: friend.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/> :
                <Icon name='md-contact'  style={{fontSize: 40, color: colors.primary}}/>}
                <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
                {selected && <Icon name='ios-checkmark-circle' style={{color: colors.primary, textAlign: 'right', flex: 1}} />}
              </View>
            </View>
          </View>
          </TouchableOpacity>
          )

    })
    return friends
  }

  onFriendPress(uid) {
    if (this.state.selectedFriends.some(friend => friend == uid)) {
      let friends = this.state.selectedFriends.filter(friend => friend != uid)
      this.setState({selectedFriends: friends})
    }
    else {
      this.setState({selectedFriends: [...this.state.selectedFriends, uid]})
    }
  }

  fetchButtons(session, uid) {
    if (session.users[uid]){
      if (session.host == uid) {
        return (
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity
          onPress={()=> {
            Alert.alert(
              "Delete session",
              "Are you sure?",
              [
              {text: 'cancel', style: 'cancel'},
              {text: 'Yes', onPress: ()=> {
                firebase.database().ref('sessions/' + session.key).remove()
                Object.keys(session.users).forEach(user => firebase.database().ref('users/' + user + '/sessions').child(session.key).remove())
                firebase.database().ref('sessionChats').child(session.key).remove()
                .then(()=> this.props.onLeave(session.key, this.props.chats))
                this.refs.modal.close()
              },
              style: 'destructive'}
              ],

              )
            
          }}
          style={{backgroundColor: 'red', padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Delete session</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=> {
            this.props.onOpenChat(true, session.key, session.title)
          }}
          style={{backgroundColor: colors.primary, padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Open chat</Text>
          </TouchableOpacity>
          </View>
          )
      }
      else return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <TouchableOpacity
          onPress={()=> {
            firebase.database().ref('users/' + uid + '/sessions').child(session.key).remove()
            .then(() => this.props.onLeave(session.key, this.props.chats))
            firebase.database().ref('sessions/' + session.key + '/users').child(uid).remove()
            this.refs.modal.close()
          }}
          style={{backgroundColor: 'red', padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Leave session</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=> {
            this.props.onOpenChat(true, session.key, session.title)
          }}
          style={{backgroundColor: colors.primary, padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Open chat</Text>
          </TouchableOpacity>
          </View>
        )
    }
    else {
      return (
          <TouchableOpacity
          onPress={()=> {
            firebase.database().ref('users/' + uid + '/sessions').child(session.key).set(true)
            .then(() => this.props.onJoin(session.key))
            firebase.database().ref('sessions/' + session.key + '/users').child(uid).set(true)
            this.refs.modal.close()
            Alert.alert("Session joined", "You should now see this session in your session chats")
          }}
          style={{backgroundColor: colors.primary, padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Join session</Text>
          </TouchableOpacity>
        )

    }
  }




  handlePress(event) {
    //Alert.alert(event.nativeEvent.coordinate.longitude.toString(), event.nativeEvent.coordinate.latitude.toString())
    ActionSheet.show(
              {
                options: ['Create session', 'Create private session', 'Cancel'],
                cancelButtonIndex: 2,
                //destructiveButtonIndex: DESTRUCTIVE_INDEX,
                title: "Create session at location?"
              },
              buttonIndex => {
                //this.setState({ clicked: BUTTONS[buttonIndex] });
              }
            )
  }

  getSessions(sessions) {
    if (sessions.length > 0) {
          return <FlatList
          refreshing={this.state.refreshing}
          onRefresh={()=> {
            this.setState({refreshing: true})
            this.listenForSessions(this.sessionsRef)
          }}
          data={sessions}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              this.setState({selectedSession: item}, ()=> this.refs.modal.open())
            }}>
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
                <View style={{flexDirection: 'row'}} >

                  <View style={{alignItems: 'center', marginRight: 10, justifyContent: 'center'}}>{getType(item.type, 40)}</View>
                    <View style={{flex: 1}}>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                        <Text style={{fontFamily: 'Avenir', fontSize: 13 }}>{"gender: " + item.gender}</Text>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={[styles.date], {color: item.inProgress? colors.secondary : "#999"}} >
                      {item.inProgress? "In progress" : this.formatDateTime(item.dateTime)}</Text>
                      {item.private && <View style={{flexDirection: 'row'}}><Icon name='ios-lock' style={{fontSize: 15, paddingHorizontal: 5}}/>
                      <Text style={{fontFamily: 'Avenir', fontSize: 12}}>PRIVATE</Text></View>}</View>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={{fontFamily: 'Avenir', flex: 2}} numberOfLines={1} >{item.location.formattedAddress}</Text>
                        <TouchableOpacity onPress={()=>{
                          this.setState({switch: true})
                          this.setState({longitude: item.location.position.lng, latitude: item.location.position.lat})
                        }}
                        style={{flex: 1}}>
                          <Text style={{color: colors.secondary, fontFamily: 'Avenir', textAlign: 'right'}}>View on map</Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
      />
          }
          else return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 20}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>
            No sessions have been created yet, also please make sure you are connected to the internet
          </Text></View>
  }

  markers(sessions) {
    let markers = []
    let index = 1
    sessions.forEach(session => {
      markers.push(
        <MapView.Marker 
          key={index}
          coordinate={{
            latitude: session.location.position.lat, 
            longitude: session.location.position.lng
          }}
          title={session.title}
        />
        )
      index++
    })
    return markers
  }

  formatDateTime(dateTime) {
    dateTime = dateTime.replace(/-/g, "/")
    let date = new Date(dateTime)
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let ampm = hours >= 12 ? 'pm' : 'am'
    hours = hours % 12
    hours = hours ? hours : 12 
    minutes = minutes < 10 ? '0'+minutes : minutes
    let strTime = hours + ':' + minutes + ampm

    let days =['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]  
    let day = date.getDate()
    return `${days[date.getDay()].toString()} ${day.toString() + this.nth(day)} ${months[date.getMonth()].toString()} ${strTime}`
  }

  nth(d) {
  if (d>3 && d<21) return 'th'
  switch (d % 10) {
        case 1:  return "st"
        case 2:  return "nd"
        case 3:  return "rd"
        default: return "th"
    }
} 

  // This is a common pattern when asking for permissions.
  // iOS only gives you once chance to show the permission dialog,
  // after which the user needs to manually enable them from settings.
  // The idea here is to explain why we need access and determine if
  // the user will say no, so that we don't blow our one chance.
  // If the user already denied access, we can ask them to enable it from settings.
  alertForLocationPermission() {
    Alert.alert(
      'Can we access your location?',
      'We need access to help find sessions near you',
      [
        {
          text: 'No way',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        this.state.locationPermission == 'undetermined'
          ? { text: 'OK', onPress: this.locationPermission() }
          : { text: 'Open Settings', onPress: Permissions.openSettings },
      ],
    )
  }

  locationPermission() {
    Permissions.request('location').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ locationPermission: response })
      if (response == 'authorized') {
        this.getPosition()
      }
      else {
        Alert.alert('Sorry', 'The app does not have access to your location some functionality may not work as a result')
      }
    })
  }

  getPosition(getDirections = false) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          yourLocation: position.coords,
          error: null,
          showMap: true,
          spinner: false}, ()=> getDirections && this.getDirections())
      },
      (error) => {
        this.setState({ spinner: false })
        Alert.alert('Error', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000, /*maximumAge: 1000*/ },
    )
  }

  getDirections() {
    if (this.state.yourLocation) {
      let lat1 = this.state.yourLocation.latitude
      let lng1 = this.state.yourLocation.longitude
      let lat2 = this.state.selectedSession.location.position.lat
      let lng2 = this.state.selectedSession.location.position.lng
      let url = `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lng1}&destination=${lat2},${lng2}`
      Linking.openURL(url).catch(err => console.error('An error occurred', err))
    }
    else {
      Alert.alert('No location found', 
        'You may need to change your settings to allow Fit Link to access your location')
    }
  }
}

import { connect } from 'react-redux'
import { navigateMessagingSession, navigateSessionType } from 'Anyone/actions/navigation'
import { fetchSessionChats, addSessionChat, removeSessionChat } from 'Anyone/actions/chats'

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats
})

const mapDispatchToProps = dispatch => ({
  getChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onJoin: (session) => {return dispatch(addSessionChat(session))},
  onLeave: (session, sessions) => {return dispatch(removeSessionChat(session, sessions))},
  onOpenChat: (session, sessionId, sessionTitle) => {return dispatch(navigateMessagingSession(session, sessionId, sessionTitle))},
  onContinue: (buddies) => dispatch(navigateSessionType(buddies))
})

export default connect(mapStateToProps, mapDispatchToProps)(Home)
