import React, { Component } from "react"
import {
  Alert,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Linking,
  Slider,
  StyleSheet
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
import Text, { globalTextStyle } from './components/Text'
import Permissions from 'react-native-permissions'
import styles from './styles/sessionStyles'
import colors from './constants/colors'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import { getType, getResource } from './constants/utils'
import str from './constants/strings'
import Hyperlink from 'react-native-hyperlink'
import {Image as SlowImage } from 'react-native'
import { formatDateTime } from './constants/utils'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { showLocation, Popup } from 'react-native-map-link'
import Header from './header/header'
import FriendsModal from './components/friendsModal'
import GymSearch from './components/GymSearch'
import { CheckBox } from 'react-native-elements'
import Button from './components/Button'

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




  render () {
    const { vicinity, name, geometry, place_id, photo, rating, }  = this.state.selectedLocation
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
        {this.gymMarkers(Object.values(this.props.places))}
        </MapView>}
        <GymSearch parent={this} onOpen={() => this.refs.locationModal.open()} />

        <View style={{flexDirection: 'row', height: 60, backgroundColor: colors.bgColor}}>
          <Button style={styles.button}
          onPress={()=> {
            this.setState({selectedLocation: {}})
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
                <Text style={{color: '#000'}}>{location && location.formattedAddress}</Text>
                <Text style={{color: '#999'}}>{' (' + (this.state.selectedSession.distance ? this.state.selectedSession.distance.toFixed(2) :
                  this.getDistance(this.state.selectedSession)) + ' km away)'}</Text>
              </Text>
              <Button onPress={()=> {
                const { lat, lng } = location && location.position
                const options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude: this.state.yourLocation.latitude,  
                  sourceLongitude: this.state.yourLocation.longitude,  
                  }
                  this.setState({popUpVisible: true, options})
                }}
                text='Directions'
              />
  
            
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
          >
          <View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Text  style={{fontSize: 20, padding: 10, color: '#000'}}>
            {name}</Text>
            <TouchableOpacity
                  onPress={()=> this.props.viewGym(place_id)}>
              <Icon name={'md-information-circle'} style={{color: colors.secondary, fontSize: 40, }}/>
            </TouchableOpacity>
          </View>
          <View style={{margin: 10}}>
            <View style={{flexDirection: 'row', marginVertical: 10, justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <Text>
                  <Text>{vicinity}</Text>
                  <Text style={{color: '#999'}}>{' (' + this.getDistance(this.state.selectedLocation, true) + ' km away)'}</Text>
                </Text>
              </View>
              <Button onPress={()=> {
                const { lat, lng } = geometry && geometry.location

                const options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude: this.state.yourLocation.latitude,  
                  sourceLongitude: this.state.yourLocation.longitude,  
                  googlePlaceId: place_id, 
                  }
                  this.setState({popUpVisible: true, options})
                }}
                style={{marginLeft: 10, alignSelf: 'flex-start'}}
                text="Directions"/>
              
            </View>
            {this.props.gym && this.props.gym.place_id == this.state.selectedLocation.place_id ? 
              <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
              <Text style={{fontWeight: 'bold', color: colors.secondary, alignSelf: 'center'}}>Your active gym</Text>
              <TouchableOpacity 
                  onPress={() => {
                    this.props.onOpenGymChat(place_id)
                  }}
                  style={{justifyContent: 'center', marginRight: 20}}>
                  <Icon name='md-chatboxes' style={{color: colors.secondary, fontSize: 40}}/>
              </TouchableOpacity>
              <Button
              onPress={() => {
                Alert.alert(
                      'Leave',
                      'Are you sure?',
                      [
                          {text: 'Cancel', style: 'cancel'},
                          {text: 'Yes', onPress: () => this.props.removeGym(), style: 'destructive'}
                      ]
                  )
                }}
              text="Leave"
              color='red'
              style={{alignSelf: 'center', marginBottom: 5}}/>
              </View> :
                <Button
                onPress={()=> {
                  if (this.props.gym) {
                        Alert.alert(
                        'Join',
                        'This will leave your current Gym?',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Yes', onPress: () => this.props.join(this.state.selectedLocation)}
                        ]
                    )
                    }
                    else this.props.join(this.state.selectedLocation)
                  }}
                style={{paddingHorizontal: 15, alignSelf: 'center', marginBottom: 10}}
                text={'Join'}
                />}
            {photo && <Image 
              style={{height: 200, width: '90%', alignSelf: 'center', marginVertical: 10}} 
             resizeMode={'contain'} 
             source={{uri: photo}}/>}
            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
              <Button
              text="Create Session"
              onPress={()=> {
                this.props.onContinue(null, this.state.selectedLocation)
              }}
              style={{flex: 1, marginRight: 10, alignItems: 'center'}}/>

              <Button
              onPress={()=> {
                this.refs.locationModal.close()
                this.setState({friendsModalOpen: true})
              }}
              text="Create Private Session"
              style={{flex: 1, alignItems: 'center'}}/>
     
              </View>
            </View>
            </View>
        </Modal>
        <Modal onOpened={() => this.setState({initialRadius: this.state.radius})} 
        onClosed={() => {
          if (this.state.radius != this.state.initialRadius) {
            this.setState({refreshing: true})
                this.props.fetch(this.state.radius, true).then(() => this.setState({refreshing: false}))
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
                        <Icon name='md-chatboxes' style={{color: colors.secondary}}/>
                      </TouchableOpacity>
                      <TouchableOpacity 
                      onPress={() => {
                        this.props.viewGym(gym.place_id)
                      }}>
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
            data={Object.values(this.props.places)}
            refreshing={this.state.refreshing}
            ListFooterComponent={Object.values(this.props.places).length > 0 && this.state.token &&
            <TouchableOpacity 
            disabled={this.state.loadingGyms}
            onPress={() => {
              this.setState({loadingGyms: true})
              const { latitude, longitude } = this.state.yourLocation
              this.props.fetchPlaces(latitude, longitude, this.state.token).then(({token}) => {
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
                      ()=> this.refs.locationModal.open())
                  }}>
                <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1, marginTop: index == 0 ? 1 : 0}}>
                  <View style={{flexDirection: 'row'}} >
                    {item.photo ? <Image source={{uri: item.photo}} style={{height: 40, width: 40, alignSelf: 'center', borderRadius: 20, marginRight: 10}}/> : 
                    <Image source={require('Anyone/assets/images/dumbbell.png')} style={{height: 40, width: 40, alignSelf: 'center', marginRight: 10}}/>}
                      <View style={{flex: 1}}>
                        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                          <Text style={[{flex: 3} , styles.title]} numberOfLines={1}>{item.name}</Text>
                        </View>
                        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                          <Text style={{flex: 2, color: '#000'}} numberOfLines={1} >{item.vicinity}</Text>
                          <TouchableOpacity onPress={()=>{
                            this.setState({longitude: lng, latitude: lat, switch: true})
                          }}
                          style={{flex: 1}}>
                            <Text style={{color: colors.secondary, textAlign: 'right', fontWeight: 'bold', fontSize: 15}}>View on map</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={{color: '#999'}}>{' (' +  this.getDistance(item, true) + ' km away)'}</Text>
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
          yourLocation: position.coords,
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
                  ()=> this.refs.locationModal.open())
                }}
            />
      }
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
      if (item.geometry) {
        lat2 = item.geometry.location.lat
        lon2 = item.geometry.location.lng
      }
      else return 'N/A'
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
  else return 'N/A'
}

gymFilter(gym) {
  return !(!this.state.pilates && gym.name.toLowerCase().includes('pilates')) &&
  !(!this.state.yoga && gym.name.toLowerCase().includes('yoga'))
}

}

export function deg2rad(deg) {
  return deg * (Math.PI / 180)
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
import { fetchSessionChats, addSessionChat } from './actions/chats'
import {
  fetchSessions,
  fetchPrivateSessions,
  removeSession,
  addUser,
  setPlaces,
  fetchPhotoPaths,
  fetchPhotoPath,
  fetchPlaces
} from './actions/sessions'
import { removeGym, joinGym, setLocation } from './actions/profile'

const mapStateToProps = ({ friends, profile, chats, sessions, sharedInfo }) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  chats: chats.sessionChats,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
  users: sharedInfo.users,
  places: sessions.places
})

const mapDispatchToProps = dispatch => ({
  join: (location) => dispatch(joinGym(location)),
  viewProfile: (uid) => dispatch(navigateProfileView(uid)),
  removeGym: () => dispatch(removeGym()),
  getChats: (sessions, uid) => dispatch(fetchSessionChats(sessions, uid)),
  onJoin: (session, isPrivate) => {
    dispatch(addUser(session, isPrivate))
    return dispatch(addSessionChat(session, isPrivate))
  },
  remove: (key, type) => dispatch(removeSession(key, type)),
  onOpenChat: (session) => dispatch(navigateMessagingSession(session)),
  onContinue: (buddies, location) => dispatch(navigateSessionDetail(buddies, location)),
  fetch: (radius, update = false) => Promise.all([dispatch(fetchSessions(radius, update)), dispatch(fetchPrivateSessions())]),
  viewGym: (id) => dispatch(navigateGym(id)),
  onOpenGymChat: (gymId) => dispatch(navigateGymMessaging(gymId)),
  setLocation: (location) => dispatch(setLocation(location)),
  test: () => dispatch(navigateTestScreen()),
  setPlaces: (places) => dispatch(setPlaces(places)),
  fetchPhotoPaths: () => dispatch(fetchPhotoPaths()),
  fetchPlaces: (lat, lon, token) => dispatch(fetchPlaces(lat, lon, token))
})

export default connect(mapStateToProps, mapDispatchToProps)(Sessions)
