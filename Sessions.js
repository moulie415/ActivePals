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
  Linking,
  Slider,
  Platform,
  ImageBackground
} from "react-native"
import {
  Button,
  Input,
  Container,
  Content,
  Item,
  Icon,
  Spinner,
  Switch,
  Header,
  Card,
  Title,
  ActionSheet,
  Left,
  Right,
} from 'native-base'
import firebase from "./index"
import Text, { globalTextStyle } from 'Anyone/constants/Text'
import Permissions from 'react-native-permissions'
import styles from './styles/sessionStyles'
import colors from './constants/colors'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import { getType, getResource } from './constants/utils'
import str from './constants/strings'
import Hyperlink from 'react-native-hyperlink'
import StarRating from 'react-native-star-rating'
import { geofire }  from 'Anyone/index'
import RNFetchBlob from 'rn-fetch-blob'

 class Sessions extends Component {

 static navigationOptions = {
    header: null,
    tabBarLabel: 'Sessions',
    tabBarIcon: ({ tintColor }) => (
      <Image style={{width: 30, height: 30, tintColor}}
    source={require('Anyone/assets/images/dumbbell.png')} />
    ),
  }
  constructor(props) {
    super(props)
    this.nav = this.props.navigation
    let sessions = Object.values(this.props.sessions)
    let privateSessions = Object.values(this.props.privateSessions)
    let combined = [...sessions, ...privateSessions]

    this.user = null
    this.state = {
      username: 'no username',
      spinner: false,
      showMap: true,
      switch: false,
      radius: 10,
      //sessions: this.sortByDateTime(Object.values(this.props.sessions)),
      sessions: this.sortByDistance(combined),
      refreshing: false,
      selectedFriends: [],
      markers: this.markers(combined),
      pointsOfInterest: [],
      places: [],
      sessionKeys: [],
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
      if (response != 'authorized') {
        this.alertForLocationPermission()
      }
      else {
        this.getPosition()
      }
    })
    // firebase.database().ref('sessions').orderByKey().limitToLast(this.state.amount).on('child_removed', snapshot => {
    //     this.props.remove(snapshot.key, snapshot.val().private)
    // })
    firebase.database().ref('users/' + this.props.profile.uid).child('sessions').on('child_removed', snapshot => {
      if (snapshot.val() == 'private') {
        this.props.remove(snapshot.key, true)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sessions || nextProps.privateSessions) {
      let sessions = Object.values(nextProps.sessions)
      let privateSessions = Object.values(nextProps.privateSessions)
      let combined = [...sessions, ...privateSessions]
      this.setState({markers: this.markers(combined), sessions: this.sortByDistance(combined)})
    }
  }



  sortByDateTime(sessions) {
    sessions.sort(function(a, b) {
        let aDate = a.dateTime.replace(/-/g, "/")
        let bDate = b.dateTime.replace(/-/g, "/")
        return new Date(aDate) - new Date(bDate)
      })
    return sessions
  }

  sortByDistance(sessions) {
    sessions.sort(function(a, b) {
      if (a.distance && b.distance) {
        let aDistance = a.distance
        let bDistance = b.distance
        return aDistance - bDistance
      }
      else return -100
    })
    return sessions
  }




  render () {
    //switch for list view and map view
    //action sheet when pressing
    return (
      <Container>

      {this.state.spinner && <Spinner style={styles.spinner} />}
        <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}} >
          <TouchableOpacity
            style={{paddingHorizontal: 10}}
            onPress={()=> {
              this.refs.filterModal.open()
            }}>
            <Text style={{color: '#fff'}}>Filters</Text>
          </TouchableOpacity>
        </Left>
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>Sessions</Title>
        <Right>
           <View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1}}>
            <Text style={{color: '#fff'}}>Map: </Text>
            <Switch value={this.state.switch} onValueChange={(val)=> this.setState({switch: val})} />
          </View>
        </Right>

        </Header>


        {!this.state.switch && this.renderSessions(this.state.sessions)}


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
        {this.state.markers}
        {this.state.pointsOfInterest}
        </MapView>}

        <View style={{flexDirection: 'row', height: 50}}>
          <TouchableOpacity style={styles.button}
          onPress={()=> {
            this.setState({selectedLocation: null})
            this.props.onContinue()
          }}>
            <Text adjustsFontSizeToFit={true}
            style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Session</Text>
          </TouchableOpacity>
          <View style={{borderRightWidth: 1, borderRightColor: '#fff'}}/>
          <TouchableOpacity style={styles.button}
          onPress={()=> {
            if (Object.keys(this.props.friends).length > 0) {
              this.setState({selectedLocation: null})
              this.refs.friendsModal.open()
            }
            else {
              Alert.alert("Sorry", "You must have at least one buddy to create a private session")
            }
          }}>
            <Text adjustsFontSizeToFit={true}
            style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Private Session</Text>
          </TouchableOpacity>
        </View>
        <Modal style={styles.modal} position={"center"} ref={"modal"} isDisabled={this.state.isDisabled}>
        {this.state.selectedSession && <View style={{flex: 1}}>
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          {this.state.selectedSession.title}</Text>
          <ScrollView style={{margin: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{color: '#000'}}>Host: </Text>
            {this.fetchHost(this.state.selectedSession.host)}
          </View>
          <Hyperlink
          linkStyle={{color: colors.secondary}}
          linkDefault={ true }>
            <Text style={{marginVertical: 5, color: '#000'}}>{this.state.selectedSession.details}</Text>
          </Hyperlink>
          <Text style={{marginVertical: 5, color: '#000'}}>{(this.formatDateTime(this.state.selectedSession.dateTime))
            + " for " + (this.state.selectedSession.duration) + " " +
            (this.state.selectedSession.duration > 1 ? 'hours' : 'hour') }</Text>
            <Text style={{marginVertical: 5}}>
              <Text style={{color: '#000'}}>{this.state.selectedSession.location.formattedAddress}</Text>
              <Text style={{color: '#999'}}>{' (' + (this.state.selectedSession.distance ? this.state.selectedSession.distance.toFixed(2) :
                this.getDistance(this.state.selectedSession)) + ' km away)'}</Text>
            </Text>
            <TouchableOpacity onPress={()=> this.getPosition(true)}
            style={{marginVertical: 5}}>
              <Text style={{color: colors.secondary}}>Get directions</Text>
            </TouchableOpacity>
            </ScrollView>
             {<View style={{justifyContent: 'flex-end', flex: 1, margin: 10}}>{this.fetchButtons(this.state.selectedSession, this.user.uid)}</View>}
            </View>}

        </Modal>
        <Modal style={styles.modal} position={"center"} ref={"friendsModal"} >
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          Select buddies</Text>
          <ScrollView style={{backgroundColor: '#d6d6d6'}}>
          {this.renderFriendsSelection()}
          </ScrollView>
          <View style={{backgroundColor: colors.primary}}>
            <TouchableOpacity onPress={()=> {
              if (this.state.selectedFriends.length > 0) {
                this.props.onContinue(this.state.selectedFriends, this.state.selectedLocation)
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
        <Modal style={[styles.modal, {height: null}]} position={'center'} ref={"locationModal"} >
          {this.state.selectedLocation && <View style={{margin: 10}}>
          <Text style={{fontWeight: 'bold', marginVertical: 5}}>{this.state.selectedLocation.name}</Text>

            <Text style={{marginVertical: 5}}>{this.state.selectedLocation.vicinity}</Text>
            {this.state.selectedLocation.rating && <View style={{flexDirection: 'row'}}>
              <Text style={{marginVertical: 5}}>Google rating: </Text>
            <StarRating
            disabled={true}
            style={{marginLeft: 10}}
            fullStarColor={colors.secondary}
            maxStars={5}
            starSize={30}
            halfStarEnabled={true}
            rating={this.state.selectedLocation.rating}
            /></View>}
            {this.state.selectedLocation.opening_hours &&
              <Text style={{color: this.state.selectedLocation.opening_hours.open_now ? colors.secondary : '#999', marginVertical: 5}}>
              {this.state.selectedLocation.opening_hours.open_now ? 'Open now' : 'Closed now'}</Text>}
            {this.state.selectedLocation.types && <Text style={{fontSize: 12, color: '#999', marginBottom: 5}}>{"Tags: " + this.renderTags(this.state.selectedLocation.types)}</Text>}
            {this.state.locationPhoto && <Image style={{height: 200, width: '90%', alignSelf: 'center', marginVertical: 10}} resizeMode={'contain'} source={{uri: this.state.locationPhoto}}/>}
            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
              <TouchableOpacity
              onPress={()=> {
                this.props.onContinue(null, this.state.selectedLocation)
              }}
              style={{backgroundColor: colors.secondary, padding: 10, flex: 1, marginRight: 10}}>
                <Text style={{color: '#fff', textAlign: 'center'}}>Create session at location</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={()=> {
                this.refs.locationModal.close()
                this.refs.friendsModal.open()
              }}
              style={{backgroundColor: colors.secondary, padding: 10, flex: 1}}>
                <Text style={{color: '#fff', textAlign: 'center'}}>Create private session at location</Text>
              </TouchableOpacity>
            </View>
            </View>}
        </Modal>
        <Modal style={styles.modal} position={'center'} ref={"filterModal"} >
            <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          Filters</Text>
          <View style={{margin: 10, flex: 1}}>
            <View style={{ flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{marginRight: 5, fontSize: 12}}>{"Search radius* " + this.state.radius + " km"}</Text>
                <Slider
                  maximumValue={50}
                  minimumValue={5}
                  minimumTrackTintColor={colors.secondary}
                  thumbTintColor={colors.secondary}
                  step={5}
                  style={{flex: 1}}
                  value={this.state.radius}
                  onValueChange={(val)=> this.setState({radius: val})}
                />
              </View>
            </View>
              <Text style={{fontSize: 12, textAlign: 'right'}}>*Public only</Text>
          </View>
            <View style={{backgroundColor: colors.primary}}>
              <TouchableOpacity
              onPress={()=> {
                this.setState({refreshing: true})
                this.props.fetch(this.state.radius, true).then(() => this.setState({refreshing: false}))
                this.refs.filterModal.close()
              }}
              style={{padding: 5}}>
                <Text style={{color: '#fff', backgroundColor: colors.secondary, alignSelf: 'center', padding: 5, paddingHorizontal: 10}}>Apply</Text>
              </TouchableOpacity>
            </View>
        </Modal>
      </Container>
      )
  }

  renderTags(tags) {
    let string = ""
    tags.forEach((tag, index, array) => {
      if (index === array.length - 1){
        string += tag
      }
      else string += tag + ", "
    })
    return string
  }

  renderFriendsSelection() {
    let friends = []
    Object.values(this.props.friends).forEach((friend, index) => {
      let selected = this.state.selectedFriends.some(uid => uid == friend.uid)
      friends.push(
          <TouchableOpacity key={index} onPress={()=> this.onFriendPress(friend.uid)}>
          <View style={{backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 10, marginBottom: 0.5}}>
            <View style={{flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between'}} >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {friend.avatar ? <Image source={{uri: friend.avatar}} style={{height: 30, width: 30, borderRadius: 15}}/> :
                <Icon name='md-contact'  style={{fontSize: 30, color: colors.primary}}/>}
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
      if (session.host.uid == uid) {
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
                this.props.remove(session.key, session.private)
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
            this.props.onOpenChat(session)
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
            this.props.remove(session.key, session.private)
            this.refs.modal.close()
          }}
          style={{backgroundColor: 'red', padding: 10, width: '40%'}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Leave session</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=> {
            this.props.onOpenChat(session)
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
            .then(() => {
              this.props.onJoin(session.key, session.private)
            })
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
    let lat = event.nativeEvent.coordinate.latitude
    let lng = event.nativeEvent.coordinate.longitude
    let location = {geometry: {location: {lat, lng}}}
    this.setState({selectedLocation: location, latitude: lat, longitude: lng})
    ActionSheet.show(
              {
                options: ['Create session', 'Create private session', 'Cancel'],
                cancelButtonIndex: 2,
                //destructiveButtonIndex: DESTRUCTIVE_INDEX,
                title: "Create session at location?"
              },
              buttonIndex => {
                //this.setState({ clicked: BUTTONS[buttonIndex] });
                if (buttonIndex == 0) {
                  this.props.onContinue(null, this.state.selectedLocation)
                }
                else if (buttonIndex == 1) {
                  if (Object.values(this.props.friends).length > 0) {
                    this.refs.friendsModal.open()
                  }
                  else {
                    Alert.alert("Sorry", "You must have at least one buddy to create a private session")
                  }
                }
              }
            )
  }

  renderSessions(sessions) {
          return <FlatList
          style={{backgroundColor: '#9993'}}
          contentContainerStyle={{flex: 1}}
          refreshing={this.state.refreshing}
          onRefresh={()=> {
            this.setState({refreshing: true})
            this.props.fetch(this.state.radius).then(()=> this.setState({refreshing: false}))
            this.getPosition()
          }}
          ListEmptyComponent={<View style={{flex: 1, justifyContent: 'center', alignSelf: 'center', marginHorizontal: 20}}>
            <Text style={{color: colors.primary, textAlign: 'center'}}>
            No sessions have been created yet, also please make sure you are connected to the internet
          </Text></View>}
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
                        <Text style={{flex: 3}} numberOfLines={1}><Text  style={styles.title}>{item.title}</Text>
                        <Text style={{color: '#999'}}>{' (' + (item.distance ? item.distance.toFixed(2) : this.getDistance(item)) + ' km away)'}</Text></Text>
                        <Text numberOfLines={1} style={{fontSize: 13, color: '#000', flex: 2}}>{"gender: " + item.gender}</Text>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={[styles.date], {color: item.inProgress ? colors.secondary : "#999"}} >
                      {item.inProgress? "In progress" : this.formatDateTime(item.dateTime)}</Text>
                      {item.private && <View style={{flexDirection: 'row'}}><Icon name='ios-lock' style={{fontSize: 15, paddingHorizontal: 5}}/>
                      <Text style={{fontSize: 12, color: '#000'}}>PRIVATE</Text></View>}</View>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={{flex: 2, color: '#000'}} numberOfLines={1} >{item.location.formattedAddress}</Text>
                        <TouchableOpacity onPress={()=>{
                          this.setState({longitude: item.location.position.lng, latitude: item.location.position.lat, switch: true})
                        }}
                        style={{flex: 1}}>
                          <Text style={{color: colors.secondary, textAlign: 'right'}}>View on map</Text>
                        </TouchableOpacity>
                      </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
      />
    }

  markers(sessions) {
    let markers = []
    sessions.forEach((session, index) => {
      let lng = session.location.position.lng
      let lat = session.location.position.lat
      markers.push(
        <MapView.Marker
          key={"s" + index.toString()}
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          //image={getResource(session.type)}
          onPress={(event) => {
            event.stopPropagation()
            this.setState({selectedSession: session, latitude: lat, longitude: lng}, ()=> this.refs.modal.open())
          }}
        >
        {getType(session.type, 40, 40)}
        </MapView.Marker>

        )
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

    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    let day = date.getDate()
    return `${days[date.getDay()].toString()} ${day.toString() + this.nth(day)} ${months[date.getMonth()].toString()} ${strTime}`
  }

  nth(d) {
  if (d > 3 && d < 21) return 'th'
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
    //to watch position:
    //this.watchID = navigator.geolocation.watchPosition((position) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude
        this.setState({
          latitude: lat,
          longitude: lon,
          yourLocation: position.coords,
          error: null,
          showMap: true,
          spinner: false}, ()=> getDirections && this.getDirections())

          this.fetchPlaces(lat, lon)
          .then((results) => {
            let markers = []
            results.forEach((result, index) => {
              let lat = result.geometry.location.lat
              let lng = result.geometry.location.lng
              markers.push(
                <MapView.Marker
                key={index}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                pinColor={colors.secondary}
                onPress={(event) => {
                  event.stopPropagation()
                  this.setState({selectedLocation: result, latitude: lat, longitude: lng},
                    ()=> {
                      if (result.photos && result.photos[0].photo_reference) {
                        let url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
                        let fullUrl = `${url}${result.photos[0].photo_reference}&key=${str.googleApiKey}`
                          RNFetchBlob.config({fileCache : true, appendExt : 'jpg'})
                          .fetch('GET', fullUrl).then(image => {
                            let path = Platform.OS == 'android' ? 'file://' + image.data : image.data
                            this.setState({locationPhoto: path}, ()=> this.refs.locationModal.open())
                          })
                      }
                      else {
                        this.setState({ locationPhoto : null}, () => this.refs.locationModal.open())
                      }
                    })
                }}
                />
                )
            })
            this.setState({pointsOfInterest: markers})

          })

      },
      (error) => {
        this.setState({ spinner: false })
        Alert.alert('Error', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000 /*, maximumAge: 1000*/ },
    )
  }

  fetchPlaces(lat, lon) {
    return new Promise(resolve => {
      let url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
      let fullUrl = `${url}location=${lat},${lon}&rankby=distance&types=gym&key=${str.googleApiKey}`
      fetch(fullUrl).then(response => response.json())
      .then(json => {
        let results1 = json.results
        if (json.next_page_token) {
          fetch(fullUrl +  `&pagetoken=${json.next_page_token}`)
          .then(response => response.json())
          .then(json => {
            let results2 = json.results
            if (json.next_page_token) {
              fetch(fullUrl +  `&pagetoken=${json.next_page_token}`)
              .then(response => response.json())
              .then(json => {
                let results3 = json.results
                let results = [...results1, ...results2, ...results3]
                resolve(results)
              })
            }
            else {
              resolve([...results1, ...results2])
            }
          })
        }
        else resolve(results1)
      })
    })
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

  fetchHost(host) {
    if (host.uid == this.props.profile.uid) {
      return <Text style={{fontWeight: 'bold'}}>You</Text>
    }
    else if (host.username) {
      return <TouchableOpacity>
              <Text style={{color: colors.secondary}}>{host.username}</Text>
            </TouchableOpacity>
    }
    else return <Text>N/A</Text>
  }

getDistance(item) {
  if (this.state.latitude) {
    let lat1 = this.state.latitude
    let lon1 = this.state.longitude
    let lat2 = item.location.position.lat
    let lon2 = item.location.position.lng
    let R = 6371
    let dLat = deg2rad(lat2 - lat1)
    let dLon = deg2rad(lon2 - lon1)
    let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    let d = R * c
    return d.toFixed(2)
  }
  else return 'unknown'
}
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}


import { connect } from 'react-redux'
import { navigateMessagingSession, navigateSessionType } from 'Anyone/actions/navigation'
import { fetchSessionChats, addSessionChat } from 'Anyone/actions/chats'
import { fetchSessions, fetchPrivateSessions, removeSession, addUser } from 'Anyone/actions/sessions'

const mapStateToProps = ({ friends, profile, chats, sessions }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
})

const mapDispatchToProps = dispatch => ({
  getChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onJoin: (session, isPrivate) => {
    dispatch(addUser(session, isPrivate))
    return dispatch(addSessionChat(session, isPrivate))
  },
  remove: (key, type) => dispatch(removeSession(key, type)),
  onOpenChat: (session) => {return dispatch(navigateMessagingSession(session))},
  onContinue: (buddies, location) => dispatch(navigateSessionType(buddies, location)),
  fetch: (radius, update = false) => {return Promise.all([dispatch(fetchSessions(radius, update)), dispatch(fetchPrivateSessions())])},
})

export default connect(mapStateToProps, mapDispatchToProps)(Sessions)
