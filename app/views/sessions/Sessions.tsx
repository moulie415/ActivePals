import React, { Component } from "react"
import {
  Alert,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  Switch
} from "react-native"
import Icon from 'react-native-vector-icons/Ionicons'
import Slider from '@react-native-community/slider'
import { PulseIndicator } from 'react-native-indicators'
import Image from 'react-native-fast-image'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from '../../components/Text'
import Permissions from 'react-native-permissions'
import styles from '../../styles/sessionStyles'
import colors from '../../constants/colors'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import { getType, getResource } from '../../constants/utils'
import str from '../../constants/strings'
import {Image as SlowImage } from 'react-native'
import { formatDateTime, getDistance } from '../../constants/utils'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { Popup } from 'react-native-map-link'
import Header from '../../components/Header/header'
import FriendsModal from '../../components/friendsModal'
import GymSearch from '../../components/GymSearch'
import { CheckBox } from 'react-native-elements'
import Button from '../../components/Button'
import PrivateIcon from '../../components/PrivateIcon'
import ActionSheet from 'react-native-actionsheet'
import {
  AdMobInterstitial,
} from 'react-native-admob'

AdMobInterstitial.setAdUnitID(str.admobInterstitial);
AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId]);

 class Sessions extends Component {

 static navigationOptions = {
    header: null,
    tabBarLabel: 'Sessions',
    tabBarIcon: ({ tintColor }) => (
      <SlowImage style={{width: 30, height: 30, tintColor}}
    source={require('Anyone/assets/images/dumbbell.png')} />
    ),
  }
  constructor(props) {
    super(props)
    const sessions = Object.values(this.props.sessions)
    const privateSessions = Object.values(this.props.privateSessions)
    const combined = [...sessions, ...privateSessions]

    this.state = {
      spinner: false,
      showMap: true,
      switch: false,
      radius: this.props.radius,
      sessions: this.sortByDistance(combined),
      refreshing: false,
      markers: this.markers(combined),
      selectedIndex: 0,
      popUpVisible: false,
      pilates: true,
      yoga: true,
      loadingGyms: false,
      selectedLocation: {}
    }
  }

  componentDidMount() {

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

  handleRefresh() {
    this.setState({refreshing: true, sessions: [], markers: [], gyms: []})
    Promise.all([
      this.props.fetch(this.state.radius),
      this.getPosition()
    ]).then(() => {
      this.setState({refreshing: false})
    })
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

  sortPlacesByDistance(places) {
    if (this.props.location) {
      const { lat, lon }  = this.props.location
      return  places.sort((a,b) => {
        const distance1 = getDistance(a, lat, lon,  true)
        const distance2 = getDistance(b, lat, lon, true)
        return distance1 - distance2
      })
    }
    else return places
  }

  render () {
    //switch for list view and map view
    //action sheet when pressing
    return (
      <>
      {this.state.spinner && <PulseIndicator color={colors.secondary} style={styles.spinner} />}
        <Header 
          left={<TouchableOpacity
            style = {{position:'absolute', top:8, bottom:0, left:0, justifyContent: 'center', paddingLeft: 10}}
            onPress={()=> {
              this.refs.filterModal.open()
            }}>
            <Text style={{color: '#fff'}}>Filters</Text>
          </TouchableOpacity>}
          title={'Sessions'}
           right={<View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: '#fff'}}>Map: </Text>
            <Switch
            trackColor={{true: colors.secondary}}
    				thumbColor={Platform.select({android: this.state.switch ? colors.secondary : '#fff'})}
            value={this.state.switch}
            onValueChange={(val)=> {
              if (val) {
                if (this.state.latitude && this.state.longitude) {
                  this.setState({switch: val})
                }
                else {
                  Alert.alert('Error', 'Sorry your location could not be found')
                }
              }
              else {
                this.setState({switch: val})
              }
              }} />
          </View>}
        />
        <View 

        style={{flex: 1}}>
        {!this.state.switch && this.renderLists()}

        {this.state.switch && this.state.showMap && <MapView
          style={styles.map}
          onPress={(event)=> this.handlePress(event)}
          //onLongPress={event => this.handlePress(event)}
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
        {this.gymMarkers(Object.values(this.props.places))}
        </MapView>}
        <GymSearch parent={this} onOpen={(id) => this.props.viewGym(id)} />

        <View style={{flexDirection: 'row', height: 60, backgroundColor: colors.bgColor}}>
          <Button style={styles.button}
          onPress={()=> {
            this.setState({selectedLocation: {}})
            AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());
            this.props.onContinue()
          }}
          text='Create Session'
          textStyle={{textAlign: 'center', fontSize: 15, textAlignVertical: 'center'}}/>
          <View style={{borderRightWidth: 1, borderRightColor: colors.bgColor}}/>
          <Button style={styles.button}
          onPress={()=> {
            if (Object.keys(this.props.friends).length > 0) {
              this.setState({selectedLocation: {}, friendsModalOpen: true})
            }
            else {
              Alert.alert("Sorry", "You must have at least one pal to create a private session")
            }
          }}
          text='Create Private Session'
          
            textStyle={{textAlign: 'center', fontSize: 15, textAlignVertical: 'center'}}/>
        </View>

        <FriendsModal 
        onClosed={()=> this.setState({friendsModalOpen: false})}
        onContinue={(friends) => {
          AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());
          this.props.onContinue(friends, this.state.selectedLocation)
        }}
        isOpen={this.state.friendsModalOpen}/>
        
        <Modal
        onClosed={() => {
          if (this.state.radius != this.props.radius) {
            this.setState({refreshing: true})
            this.props.setRadius(this.state.radius)
            this.props.fetch().then(() => this.setState({refreshing: false}))
          }
        }}
        style={styles.modal}
      position={'center'} ref={"filterModal"} >
          <View style={{ flex: 1, borderRadius: 5}}>
          <Text style={styles.sessionFilterTitle}>
          Sessions</Text>
            <View style={styles.sessionFilterContainer}>
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
              <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <Text style={{fontSize: 12, textAlign: 'right', margin: 10}}>*Public only (private sessions should always be visible)</Text>
              </View>
            </View>
          </View>
          <View style={{flex: 1}}>
            <Text style={{
              fontSize: 20,
              textAlign: 'center',
              padding: 10,
              color: '#000',
              fontWeight: 'bold'
              }}>
              Gyms</Text>
              <TouchableOpacity
              onPress={() => this.setState({yoga: !this.state.yoga})}
              style={{flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#999'}}>
                <CheckBox
                containerStyle={{backgroundColor: 'transparent', width: 45, borderWidth: 0}}
                checkedColor={colors.secondary}
                uncheckedColor={colors.secondary}
                checked={this.state.yoga}
                onPress={() => this.setState({yoga: !this.state.yoga})}
                />
                <Text>Show Yoga</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={() => this.setState({pilates: !this.state.pilates})}
              style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                containerStyle={{backgroundColor: 'transparent', width: 45, borderWidth: 0}}
                checkedColor={colors.secondary}
                uncheckedColor={colors.secondary}
                checked={this.state.pilates}
                onPress={() => this.setState({pilates: !this.state.pilates})}
                />
                <Text>Show Pilates</Text>
              </TouchableOpacity>
          </View>
        </Modal>
        <Popup
          isVisible={this.state.popUpVisible}
          onCancelPressed={() => this.setState({ popUpVisible: false })}
          onAppPressed={() => this.setState({ popUpVisible: false })}
          onBackButtonPressed={() => this.setState({ popUpVisible: false })}
          modalProps={{ 
              animationIn: 'slideInUp'
          }}
          options={this.state.options}
          style={{
            cancelButtonText: {color: colors.secondary},
          }}
          />
        </View>
        <ActionSheet
          ref={ref => this.ActionSheet = ref}
          title='Create session at location?'
          options={['Create session', 'Create private session', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => { 
                if (index == 0) {
                  AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());
                  this.props.onContinue(null, this.state.selectedLocation)
                }
                else if (index == 1) {
                  if (Object.values(this.props.friends).length > 0) {
                    this.setState({friendsModalOpen: true})
                  }
                  else {
                    Alert.alert('Sorry', 'You must have at least one pal to create a private session')
                  }
              }
           }}
        />
      </>
      )
  }


  handlePress(event) {
    const lat = event.nativeEvent.coordinate.latitude
    const lng = event.nativeEvent.coordinate.longitude
    const location = {geometry: {location: {lat, lng}}}
    this.setState({selectedLocation: location, latitude: lat, longitude: lng})
    this.ActionSheet.show()
  }

  renderLists() {
    let gym, yourLat, yourLon
      if (this.props.gym && this.props.gym.geometry) {
        gym = this.props.gym
        lat = gym.geometry.location.lat
        lng = gym.geometry.location.lng
      }
      if (this.props.location) {
        yourLat = this.props.location.lat
        yourLon = this.props.location.lon
      }
          return <View style={{flex: 1, marginTop: 45}}>
          <SegmentedControlTab
            values={['Sessions', 'Gyms near you']}
            selectedIndex={this.state.selectedIndex}
            onTabPress={(index)=> {
              this.setState({selectedIndex: index})
            }}
            tabsContainerStyle={{marginHorizontal:8, marginVertical: 5}}
            tabStyle={{borderColor:colors.secondary}}
            tabTextStyle={{color:colors.secondary, fontFamily: 'Montserrat'}}
            activeTabStyle={{backgroundColor:colors.secondary}}
            />
              {gym && this.state.selectedIndex == 1 && 
              <View style={{padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary}}>
                <View style={{flexDirection: 'row'}} >
                {gym.photo ? <Image source={{uri: gym.photo}} style={{height: 40, width: 40, alignSelf: 'center', borderRadius: 20, marginRight: 10}}/> : 
                  <Image source={require('Anyone/assets/images/dumbbell.png')} style={{height: 40, width: 40, alignSelf: 'center', marginRight: 10}}/>}
                    <View style={{flex: 1}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View>
                      <Text style={{color: colors.secondary}}>Your gym:</Text>
                      <Text>{gym.name}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity 
                      onPress={() => {
                          this.props.onOpenGymChat(gym.place_id)
                      }}
                      style={{
                        justifyContent: 'center',
                        marginRight: 20
                        }}>
                        <Icon name='md-chatboxes' size={25} style={{color: colors.secondary}}/>
                      </TouchableOpacity>
                      <TouchableOpacity 
                      onPress={() => {
                        this.props.viewGym(gym.place_id)
                      }}>
                        <Icon name='md-information-circle' size={25} style={{color: colors.secondary}}/>
                      </TouchableOpacity>
                      </View>
                    </View>

                  </View>
                </View>
              </View>}
          {this.state.selectedIndex == 0 ? <FlatList
          style={{backgroundColor: '#9993'}}
          refreshing={this.state.refreshing}
          onRefresh={() => this.handleRefresh()}
          contentContainerStyle={[{flexGrow: 1}, this.state.sessions.length > 0 ? null : { justifyContent: 'center'}]}
          ListEmptyComponent={<View>
            <Text style={{color: colors.primary, textAlign: 'center', marginHorizontal: 20}}>
            No sessions near you have been created yet, also please make sure you are connected to the internet
          </Text></View>}
          data={this.state.sessions}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
                this.props.viewSession(item.key, item.private)
            }}>
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1, marginTop: index == 0 ? 1 : 0}}>
                <View style={{flexDirection: 'row'}} >

                  <View style={{alignItems: 'center', marginRight: 10, justifyContent: 'center'}}>{getType(item.type, 40)}</View>
                    <View style={{flex: 5}}>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={{flex: 3}} numberOfLines={1}><Text  style={styles.title}>{item.title}</Text>
                        <Text style={{color: '#999'}}>{' (' + (item.distance ? item.distance.toFixed(2) : getDistance(item, yourLat, yourLon)) + ' km away)'}</Text></Text>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={[styles.date, {color: item.inProgress ? colors.secondary : "#999"}]} >
                      {item.inProgress? "In progress" : formatDateTime(item.dateTime)}</Text>
                      {item.private && <PrivateIcon size={25}/>}</View>
                      <Text style={{flex: 2, color: '#000'}} numberOfLines={1} >{item.location.formattedAddress}</Text>
                  </View>
                  <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
                    <TouchableOpacity onPress={()=>{
                      this.setState({longitude: item.location.position.lng, latitude: item.location.position.lat, switch: true})
                    }}>
                      <Icon name="ios-pin" size={40} style={{color: colors.secondary}}/>
                    </TouchableOpacity>
                  </View>

                </View>
              </View>
            </TouchableOpacity>
          )}
      /> : <FlatList 
            data={this.sortPlacesByDistance(Object.values(this.props.places))}
            refreshing={this.state.refreshing}
            ListFooterComponent={Object.values(this.props.places).length > 0 && this.state.token &&
            <TouchableOpacity 
            disabled={this.state.loadingGyms}
            onPress={() => {
              this.setState({loadingGyms: true})
              this.props.fetchPlaces(lat, lon, this.state.token).then(({token}) => {
                this.setState({loadingGyms: false, token})
              })
            }}>
              {!this.state.loadingGyms  && !this.state.refreshing ? 
              <Text style={{color: colors.secondary, textAlign: 'center', backgroundColor: '#fff', fontSize: 20, paddingVertical: 5}}>
              Load more gyms
              </Text> :
              <PulseIndicator color={colors.secondary} />
              }
            </TouchableOpacity>}
            onRefresh={() => this.handleRefresh()}
            style={{backgroundColor: '#9993'}}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item, index }) => {
              const { lat, lng } = item.geometry.location
              if (this.gymFilter(item)) {
                return <TouchableOpacity onPress={() => {
                  this.setState({selectedLocation: item, latitude: lat, longitude: lng},
                      ()=> this.props.viewGym(item.place_id))
                  }}>
                <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1, marginTop: index == 0 ? 1 : 0}}>
                  <View style={{flexDirection: 'row'}} >
                    {item.photo ? <Image source={{uri: item.photo}} style={{height: 40, width: 40, alignSelf: 'center', borderRadius: 20, marginRight: 10}}/> : 
                    <Image source={require('Anyone/assets/images/dumbbell.png')} style={{height: 40, width: 40, alignSelf: 'center', marginRight: 10}}/>}
                      <View style={{flex: 5}}>
                        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                          <Text style={[{flex: 3} , styles.title]} numberOfLines={1}>{item.name}</Text>
                        </View>
                        <Text style={{flex: 2, color: '#000'}} numberOfLines={1} >{item.vicinity}</Text>
                        <Text style={{color: '#999'}}>{' (' +  getDistance(item, yourLat, yourLon, true) + ' km away)'}</Text>
                    </View>
                    <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
                    <TouchableOpacity onPress={()=>{
                      this.setState({longitude: lng, latitude: lat, switch: true})
                    }}>
                      <Icon size={40} name="ios-pin" style={{color: colors.secondary}}/>
                    </TouchableOpacity>
                  </View>
                  </View>
                </View>
              </TouchableOpacity>
              }
          }}
      />}
      </View>
    }

  markers(sessions) {
    return sessions.map((session, index) => {
      const lng = session.location.position.lng
      const lat = session.location.position.lat
      return <MapView.Marker
          key={"s" + index.toString()}
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          onPress={(event) => {
            event.stopPropagation()
            this.setState({latitude: lat, longitude: lng}, 
            ()=> {
              Alert.alert(
              `View session ${session.title}?`,
              '',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'OK', onPress: () => this.props.viewSession(session.key, session.private)},
              ]
              )
            })
          }}
        >
        {getType(session.type, 40)}
        </MapView.Marker>
    })
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
        Alert.alert('Sorry', 'The app does not have access to your location, some functionality may not work as a result')
      }
    })
  }

  getPosition() {
    //to watch position:
    //this.watchID = navigator.geolocation.watchPosition((position) => {
    return navigator.geolocation.getCurrentPosition(
      (position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude
        this.props.setLocation({lat, lon})
        this.setState({
          latitude: lat,
          longitude: lon,
          error: null,
          showMap: true,
          spinner: false
        })

          return this.props.fetchPlaces(lat, lon, this.state.token)
          .then(({token}) => {
            this.setState({token})
          })

      },
      (error) => {
        this.setState({ spinner: false })
        Alert.alert('Error', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000 /*, maximumAge: 1000*/ },
    )
  }

  gymMarkers(results) {
    return results.map((result) => {
      if (result.geometry) {
        const lat = result.geometry.location.lat
        const lng = result.geometry.location.lng
        return <MapView.Marker
                key={result.place_id}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                pinColor={colors.secondary}
                onPress={(event) => {
                event.stopPropagation()
                this.setState({selectedLocation: result, latitude: lat, longitude: lng},
                  ()=> {
                    Alert.alert(
                      `View gym ${result.name}?`,
                      '',
                      [
                        {text: 'Cancel', style: 'cancel'},
                        {text: 'OK', onPress: () => this.props.viewGym(result.place_id)},
                      ]
                      )
                  })
                }}
            />
      }
    })
  }


gymFilter(gym) {
  return !(!this.state.pilates && gym.name.toLowerCase().includes('pilates')) &&
  !(!this.state.yoga && gym.name.toLowerCase().includes('yoga'))
}

}

import { connect } from 'react-redux'
import {
  navigateMessagingSession,
  navigateTestScreen,
  navigateProfileView,
  navigateGym,
  navigateGymMessaging,
  navigateSessionDetail,
  navigateSessionInfo
} from '../../actions/navigation'
import { fetchSessionChats } from '../../actions/chats'
import {
  fetchSessions,
  fetchPrivateSessions,
  removeSession,
  setPlaces,
  fetchPhotoPaths,
  fetchPlaces,
  setRadius
} from '../../actions/sessions'
import { removeGym, joinGym, setLocation } from '../../actions/profile'

const mapStateToProps = ({ friends, profile, chats, sessions, sharedInfo }) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  chats: chats.sessionChats,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
  users: sharedInfo.users,
  places: sessions.places,
  radius: sessions.radius,
  location: profile.location,
})

const mapDispatchToProps = dispatch => ({
  join: (location) => dispatch(joinGym(location)),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  removeGym: () => dispatch(removeGym()),
  getChats: (sessions, uid) => dispatch(fetchSessionChats(sessions, uid)),
  remove: (key, type) => dispatch(removeSession(key, type)),
  onOpenChat: (session) => dispatch(navigateMessagingSession(session)),
  onContinue: (friends, location) => dispatch(navigateSessionDetail(friends, location)),
  fetch: () => Promise.all([dispatch(fetchSessions()), dispatch(fetchPrivateSessions())]),
  viewGym: (id) => dispatch(navigateGym(id)),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
  setLocation: (location) => dispatch(setLocation(location)),
  test: () => dispatch(navigateTestScreen()),
  setPlaces: (places) => dispatch(setPlaces(places)),
  fetchPhotoPaths: () => dispatch(fetchPhotoPaths()),
  fetchPlaces: (lat, lon, token) => dispatch(fetchPlaces(lat, lon, token)),
  setRadius: (radius) => dispatch(setRadius(radius)),
  viewSession: (sessionId, isPrivate) => dispatch(navigateSessionInfo(sessionId, isPrivate))
})

export default connect(mapStateToProps, mapDispatchToProps)(Sessions)
