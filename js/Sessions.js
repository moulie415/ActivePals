import React, { Component } from "react"
import {
  Alert,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Linking,
  Slider,
  Platform,
} from "react-native"
import {
  Container,
  Icon,
  Switch,
  ActionSheet,
} from 'native-base'
import { PulseIndicator } from 'react-native-indicators'
import Image from 'react-native-fast-image'
import firebase from 'react-native-firebase'
import Text, { globalTextStyle } from 'Anyone/js/constants/Text'
import Permissions from 'react-native-permissions'
import styles from './styles/sessionStyles'
import colors from './constants/colors'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import { getType, getResource } from './constants/utils'
import str from './constants/strings'
import Hyperlink from 'react-native-hyperlink'
import RNFetchBlob from 'rn-fetch-blob'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import {Image as SlowImage } from 'react-native'
import { formatDateTime } from './constants/utils'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { showLocation, Popup } from 'react-native-map-link'
import Header from './header/header'
import FriendsModal from './components/friendsModal'
import GymSearch from './components/GymSearch'

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
      radius: 10,
      //sessions: this.sortByDateTime(Object.values(this.props.sessions)),
      sessions: this.sortByDistance(combined),
      refreshing: false,
      markers: this.markers(combined),
      gymMarkers: [],
      gyms: [],
      selectedIndex: 0,
      popUpVisible: false,
      loadMore: true,
      loadingGyms: false,
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
    this.setState({refreshing: true, sessions: [], markers: [], gymMarkers: [], gyms: []})
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




  render () {
    //switch for list view and map view
    //action sheet when pressing
    return (
      <Container>

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
           right={<View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
            <Text style={{color: '#fff'}}>Map: </Text>
            <Switch value={this.state.switch} onValueChange={(val)=> {
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
        {this.state.gymMarkers}
        </MapView>}
        {GymSearch(this)}

        <View style={{flexDirection: 'row', height: 60, backgroundColor: colors.bgColor}}>
          <TouchableOpacity style={styles.button}
          onPress={()=> {
            this.setState({selectedLocation: null})
            this.props.onContinue()
          }}>
            <Text adjustsFontSizeToFit={true}
            style={{textAlign: 'center', color: '#fff', fontSize: 15, textAlignVertical: 'center'}}>Create Session</Text>
          </TouchableOpacity>
          <View style={{borderRightWidth: 1, borderRightColor: colors.bgColor}}/>
          <TouchableOpacity style={styles.button}
          onPress={()=> {
            if (Object.keys(this.props.friends).length > 0) {
              this.setState({selectedLocation: null, friendsModalOpen: true})
            }
            else {
              Alert.alert("Sorry", "You must have at least one pal to create a private session")
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
          <View style={{flexDirection: 'row', flex: 1}}>
            <Text style={{color: '#000'}}>Host: </Text>
            {this.fetchHost(this.state.selectedSession.host)}
            </View>
            {this.state.selectedSession.private && <View style={{flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Icon name='ios-lock' style={{fontSize: 20, paddingHorizontal: 5}}/>
            <Text>PRIVATE</Text>
            </View>}
          </View>
          <Hyperlink
          linkStyle={{color: colors.secondary}}
          linkDefault={ true }>
            <Text style={{marginVertical: 5, color: '#000'}}>{this.state.selectedSession.details}</Text>
          </Hyperlink>
          <Text style={{marginVertical: 5, color: '#000'}}>{(formatDateTime(this.state.selectedSession.dateTime))
            + " for " + (this.state.selectedSession.duration) + " " +
            (this.state.selectedSession.duration > 1 ? 'hours' : 'hour') }</Text>
            
            <View style={{flexDirection: 'row', marginVertical: 5, alignItems: 'center',justifyContent: 'space-between'}}>
              <Text style={{flex: 1}}>
                <Text style={{color: '#000'}}>{this.state.selectedSession.location.formattedAddress}</Text>
                <Text style={{color: '#999'}}>{' (' + (this.state.selectedSession.distance ? this.state.selectedSession.distance.toFixed(2) :
                  this.getDistance(this.state.selectedSession)) + ' km away)'}</Text>
              </Text>
              <TouchableOpacity onPress={()=> {
                this.getPosition()
                const { lat, lng } = this.state.selectedSession.location.position
                let options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude: this.state.yourLocation.latitude,  
                  sourceLongitude: this.state.yourLocation.longitude,  
                  }
                  this.setState({popUpVisible: true, options})
                }}
              style={{backgroundColor: colors.secondary, padding: 10, borderRadius: 5}}>
                <Text style={{color: '#fff'}}>Get directions</Text>
              </TouchableOpacity>
            
            </View>
            </ScrollView>
             {<View style={{justifyContent: 'flex-end', flex: 1, margin: 10}}>
             {this.fetchButtons(this.state.selectedSession, this.props.profile.uid)}
             </View>}
            </View>}

        </Modal>
        <FriendsModal 
        location={this.state.selectedLocation} 
        onClosed={()=> this.setState({friendsModalOpen: false})}
        isOpen={this.state.friendsModalOpen}/>
        
        <Modal
          style={[styles.modal, {height: null}]} 
          position={'center'} 
          ref={"locationModal"} 
          onClosed={()=> this.setState({loadedGymImage: false})}>
          {this.state.selectedLocation && <View>
          <Text style={{fontSize: 20, textAlign: 'center', padding: 10, backgroundColor: colors.primary, color: '#fff'}}>
          {this.state.selectedLocation.name}</Text>
          <View style={{margin: 10}}>
            <View style={{flexDirection: 'row', marginTop: 5, justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>
                  <Text>{this.state.selectedLocation.vicinity}</Text>
                  <Text style={{color: '#999'}}>{' (' + this.getDistance(this.state.selectedLocation, true) + ' km away)'}</Text>
                </Text>
              </View>
              <TouchableOpacity onPress={()=> {
                this.getPosition()
                const { lat, lng } = this.state.selectedLocation.geometry.location
                const place_id = this.state.selectedLocation.place_id

                let options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude: this.state.yourLocation.latitude,  
                  sourceLongitude: this.state.yourLocation.longitude,  
                  googlePlaceId: place_id, 
                  }
                  this.setState({popUpVisible: true, options})
                }}
              style={{backgroundColor: colors.secondary, padding: 10, borderRadius: 5, height: 40}}>
                <Text style={{color: '#fff'}}>Get directions</Text>
              </TouchableOpacity>
              
            </View>
            {this.state.selectedLocation.rating && <Text style={{marginTop: 5}}>{'Google rating: '}
                      <Text style={{color: colors.secondary}}>{this.state.selectedLocation.rating}</Text>
                      </Text>}
            {this.props.gym && this.props.gym.place_id == this.state.selectedLocation.place_id ? 
              <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Your active gym</Text>
              <TouchableOpacity 
                  onPress={() => {
                    this.props.onOpenGymChat(this.state.selectedLocation.place_id)
                  }}
                  style={{justifyContent: 'center', marginRight: 20}}>
                  <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 40}}/>
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={() => {
                Alert.alert(
                      'Leave Gym',
                      'Are you sure?',
                      [
                          {text: 'Cancel', style: 'cancel'},
                          {text: 'Yes', onPress: () => this.props.removeGym(), style: 'destructive'}
                      ]
                  )
                }}
              style={{padding: 5, paddingVertical: 10, alignSelf: 'center', marginBottom: 5, backgroundColor: 'red', borderRadius: 5}}>
              <Text style={{color: '#fff'}}>Leave Gym</Text>
              </TouchableOpacity></View> :
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 5}}>
                <TouchableOpacity
                onPress={()=> {
                  if (this.props.gym) {
                        Alert.alert(
                        'Join Gym',
                        'This will leave your current Gym?',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Yes', onPress: () => this.props.join(this.state.selectedLocation)}
                        ]
                    )
                    }
                    else this.props.join(this.state.selectedLocation)
                  }}
                style={{backgroundColor: colors.secondary, padding: 10, alignSelf: 'center', marginBottom: 10, borderRadius: 5}}>
                <Text style={{color: '#fff'}}>Join Gym</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={()=> this.props.viewGym(this.state.selectedLocation.place_id)}
                style={{
                  backgroundColor: colors.secondary,
                  padding: 5,
                  paddingHorizontal: 8,
                  alignSelf: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  borderRadius: 5,
                  }}>
                <Text style={{color: '#fff', marginRight: 10}}>View info</Text>
                <Icon name={'md-information-circle'} style={{color: '#fff'}}/>
                </TouchableOpacity>
              </View>}
            {this.state.locationPhoto ?
            this.state.loadedGymImage ? <Image 
              style={{height: 200, width: '90%', alignSelf: 'center', marginVertical: 10}} 
             resizeMode={'contain'} 
             source={{uri: this.state.locationPhoto}}/> : 
             <View style={{alignItems: 'center', justifyContent: 'center', height: 200}}>
              <PulseIndicator color={colors.secondary} />
              </View> : null}
            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
              <TouchableOpacity
              onPress={()=> {
                this.props.onContinue(null, this.state.selectedLocation)
              }}
              style={{backgroundColor: colors.secondary, padding: 10, flex: 1, marginRight: 10, borderRadius: 5}}>
                <Text style={{color: '#fff', textAlign: 'center'}}>Create Session</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={()=> {
                this.refs.locationModal.close()
                this.setState({friendsModalOpen: true})
              }}
              style={{backgroundColor: colors.secondary, padding: 10, flex: 1, borderRadius: 5}}>
                <Text style={{color: '#fff', textAlign: 'center'}}>Create Private Session</Text>
              </TouchableOpacity>
              </View>
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
              <Text style={{fontSize: 12, textAlign: 'right'}}>*Public only (private sessions should always be visible)</Text>
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
      </Container>
      )
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
          style={{backgroundColor: 'red', padding: 10, width: '40%', borderRadius: 5}}>
            <Text style={{color: '#fff', textAlign: 'center'}}>Delete session</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=> {
            this.props.onOpenChat(session)
          }}
          style={{backgroundColor: colors.secondary, padding: 10, width: '40%', borderRadius: 5}}>
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
            Alert.alert('Session joined', 'You should now see this session in your session chats')
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
                title: 'Create session at location?'
              },
              buttonIndex => {
                //this.setState({ clicked: BUTTONS[buttonIndex] });
                if (buttonIndex == 0) {
                  this.props.onContinue(null, this.state.selectedLocation)
                }
                else if (buttonIndex == 1) {
                  if (Object.values(this.props.friends).length > 0) {
                    this.setState({friendsModalOpen: true})
                  }
                  else {
                    Alert.alert('Sorry', 'You must have at least one pal to create a private session')
                  }
                }
              }
            )
  }

  renderLists() {
    let gym, lat, lng
      if (this.props.gym && this.props.gym.geometry) {
        gym = this.props.gym
        lat = gym.geometry.location.lat
        lng = gym.geometry.location.lng
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
            tabTextStyle={{color:colors.secondary}}
            activeTabStyle={{backgroundColor:colors.secondary}}
            />
              {gym && this.state.selectedIndex == 1 && 
              <View style={{padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary}}>
                <View style={{flexDirection: 'row'}} >

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
                      style={{justifyContent: 'center', marginRight: 20}}>
                        <Icon name='md-chatboxes' style={{color: colors.secondary}}/>
                      </TouchableOpacity>
                      <TouchableOpacity 
                      onPress={() => {
                        this.props.viewGym(gym.place_id)
                      }}
                      style={{justifyContent: 'center'}}>
                        <Icon name='md-information-circle' style={{color: colors.secondary}}/>
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
          ListEmptyComponent={<View style={{flex: 1, justifyContent: 'center', alignSelf: 'center'}}>
            <Text style={{color: colors.primary, textAlign: 'center', margin: 20}}>
            No sessions have been created yet, also please make sure you are connected to the internet
          </Text></View>}
          data={this.state.sessions}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
                this.setState({selectedSession: item}, ()=> this.refs.modal.open())
            }}>
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1, marginTop: index == 0 ? 1 : 0}}>
                <View style={{flexDirection: 'row'}} >

                  <View style={{alignItems: 'center', marginRight: 10, justifyContent: 'center'}}>{getType(item.type, 40)}</View>
                    <View style={{flex: 1}}>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={{flex: 3}} numberOfLines={1}><Text  style={styles.title}>{item.title}</Text>
                        <Text style={{color: '#999'}}>{' (' + (item.distance ? item.distance.toFixed(2) : this.getDistance(item)) + ' km away)'}</Text></Text>
                        <Text numberOfLines={1} style={{fontSize: 13, color: '#000', flex: 2, textAlign: 'right'}}>{"gender: " + item.gender}</Text>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={[styles.date, {color: item.inProgress ? colors.secondary : "#999"}]} >
                      {item.inProgress? "In progress" : formatDateTime(item.dateTime)}</Text>
                      {item.private && <View style={{flexDirection: 'row'}}><Icon name='ios-lock' style={{fontSize: 20, paddingHorizontal: 5}}/></View>}</View>
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
      /> : <FlatList 
            data={this.state.gyms}
            refreshing={this.state.refreshing}
            ListFooterComponent={this.state.gyms && this.state.loadMore &&
            <TouchableOpacity 
            disabled={this.state.loadingGyms}
            onPress={() => {
              this.setState({loadingGyms: true})
              const { latitude, longitude } = this.state.yourLocation
              this.fetchPlaces(latitude, longitude, true).then(results => {
                this.gymMarkers(results)
                this.setState({loadingGyms: false})
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
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const { lat, lng } = item.geometry.location
              return <TouchableOpacity onPress={() => {
                this.setState({selectedLocation: item, latitude: lat, longitude: lng},
                    ()=> {
                      //this.refs.locationModal.open()
                      fetchPhotoPath(item).then(path => {
                          this.setState({locationPhoto: path, loadedGymImage: true}, ()=> this.refs.locationModal.open())
                      })
                    })
            }}>
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1, marginTop: index == 0 ? 1 : 0}}>
                <View style={{flexDirection: 'row'}} >

                    <View style={{flex: 1}}>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={[{flex: 3} , styles.title]} numberOfLines={1}>{item.name}</Text>
                        <Text style={{color: '#999', flex: 1, textAlign: 'right'}}>{' (' +  this.getDistance(item, true) + ' km away)'}</Text>
                      </View>
                      <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                        <Text style={{flex: 2, color: '#000'}} numberOfLines={1} >{item.vicinity}</Text>
                        <TouchableOpacity onPress={()=>{
                          this.setState({longitude: lng, latitude: lat, switch: true})
                        }}
                        style={{flex: 1}}>
                          <Text style={{color: colors.secondary, textAlign: 'right'}}>View on map</Text>
                        </TouchableOpacity>
                      </View>
                      {item.rating && <Text>{'Google rating: '}
                      <Text style={{color: colors.secondary}}>{item.rating}</Text>
                      </Text>}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
            this.setState({selectedSession: session, latitude: lat, longitude: lng}, ()=> this.refs.modal.open())
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
        Alert.alert('Sorry', 'The app does not have access to your location some functionality may not work as a result')
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
          yourLocation: position.coords,
          error: null,
          showMap: true,
          spinner: false
        })

          return this.fetchPlaces(lat, lon)
          .then((results) => {
            this.gymMarkers(results)
          })

      },
      (error) => {
        this.setState({ spinner: false })
        Alert.alert('Error', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000 /*, maximumAge: 1000*/ },
    )
  }

  fetchPlaces(lat, lon, loadMore) {
    return new Promise(resolve => {
      const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
      const fullUrl = `${url}location=${lat},${lon}&rankby=distance&types=gym&key=${str.googleApiKey}`

      if (loadMore) {
        if (this.state.token) {
          fetch(fullUrl +  `&pagetoken=${this.state.token}`)
          .then(response => response.json())
          .then(json => {
            resolve(json.results)
            if (json.next_page_token) {
              this.setState({token: json.next_page_token})
            }
            else {
              this.setState({loadMore: false})
            }
          })
        }
        else {
          this.setState({loadMore: false})
        }
      }
      else {
        fetch(fullUrl).then(response => response.json())
        .then(json => {
          resolve(json.results)
          this.setState({token: json.next_page_token})
        })
      }
    })
  }

  gymMarkers(results) {
    const markers = results.map((result) => {
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
                  //this.refs.locationModal.open()
                  fetchPhotoPath(result).then(path => {
                    this.setState({locationPhoto: path, loadedGymImage: true}, ()=> this.refs.locationModal.open() )
                  })
                })
              }}
          />
    })
    this.setState({
      gymMarkers: [...this.state.gymMarkers, ...markers],
      gyms: [...this.state.gyms, ...results]
    })
  }



  getDirections(gym) {
    if (this.state.yourLocation) {
      let lat2, lng2
      const lat1 = this.state.yourLocation.latitude
      const lng1 = this.state.yourLocation.longitude
      if (gym) {
        lat2  = this.state.selectedLocation.geometry.location.lat
        lng2 = this.state.selectedLocation.geometry.location.lng
      }
      else {
        lat2 = this.state.selectedSession.location.position.lat
        lng2 = this.state.selectedSession.location.position.lng
      }
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
      return <TouchableOpacity onPress={()=> this.props.viewProfile(host.uid)}>
              <Text style={{color: colors.secondary}}>{host.username}</Text>
            </TouchableOpacity>
    }
    else if (this.props.users[host.uid]) {
      return <TouchableOpacity onPress={()=> this.props.viewProfile(host.uid)}>
              <Text style={{color: colors.secondary}}>{this.props.users[host.uid].username}</Text>
            </TouchableOpacity>
    }
    else return <Text>N/A</Text>
  }

getDistance(item, gym = false) {
  if (this.state.yourLocation) {
    let lat1 = this.state.yourLocation.latitude
    let lon1 =  this.state.yourLocation.longitude
    let lat2
    let lon2
    if (gym) {
      lat2 = item.geometry.location.lat
      lon2 = item.geometry.location.lng
    }
    else {
      lat2 = item.location.position.lat
      lon2 = item.location.position.lng
    }
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

export function deg2rad(deg) {
  return deg * (Math.PI / 180)
}


export const fetchPhotoPath = (result) => {
  return new Promise(resolve => {
    if (result.photos && result.photos[0].photo_reference) {
      let url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference='
      let fullUrl = `${url}${result.photos[0].photo_reference}&key=${str.googleApiKey}`
      RNFetchBlob.config({fileCache : true, appendExt : 'jpg'})
      .fetch('GET', fullUrl).then(image => {
        let path = Platform.OS == 'android' ? 'file://' + image.data : image.data
        resolve(path)
      })
      .catch(e => {
        console.log(e)
        resolve(false)
      })
    }
    else resolve(false)

  })
}

export const renderTags = (tags) => {
  let string = ""
  tags.forEach((tag, index, array) => {
    if (index === array.length - 1){
      string += tag
    }
    else string += tag + ", "
  })
  return string
}



import { connect } from 'react-redux'
import {
  navigateMessagingSession,
  navigateTestScreen,
  navigateProfileView,
  navigateGym,
  navigateGymMessaging,
  navigateSessionDetail
} from './actions/navigation'
import { fetchSessionChats, addSessionChat } from 'Anyone/js/actions/chats'
import { fetchSessions, fetchPrivateSessions, removeSession, addUser } from 'Anyone/js/actions/sessions'
import { removeGym, joinGym, setLocation } from 'Anyone/js/actions/profile'

const mapStateToProps = ({ friends, profile, chats, sessions, sharedInfo }) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  chats: chats.sessionChats,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
  users: sharedInfo.users
})

const mapDispatchToProps = dispatch => ({
  join: (location) => dispatch(joinGym(location)),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  removeGym: () => dispatch(removeGym()),
  getChats: (sessions, uid) => {return dispatch(fetchSessionChats(sessions, uid))},
  onJoin: (session, isPrivate) => {
    dispatch(addUser(session, isPrivate))
    return dispatch(addSessionChat(session, isPrivate))
  },
  remove: (key, type) => dispatch(removeSession(key, type)),
  onOpenChat: (session) => {return dispatch(navigateMessagingSession(session))},
  onContinue: (buddies, location) => dispatch(navigateSessionDetail(buddies, location)),
  fetch: (radius, update = false) => {return Promise.all([dispatch(fetchSessions(radius, update)), dispatch(fetchPrivateSessions())])},
  viewGym: (id) => dispatch(navigateGym(id)),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
  setLocation: (location) => dispatch(setLocation(location)),
  test: () => dispatch(navigateTestScreen()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Sessions)
