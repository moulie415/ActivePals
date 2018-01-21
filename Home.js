import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  FlatList,
  TouchableOpacity
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
  Card
} from 'native-base'
import firebase from "./index"
import Permissions from 'react-native-permissions'
import styles from './styles/homeStyles'
import colors from './constants/colors'
import MapView from 'react-native-maps'


 export default class Home extends Component {

 static navigationOptions = {
    header: null,
    tabBarLabel: 'Home',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        name='home'
        style={{ color: tintColor }}
      />
    ),
  }
  constructor(props) {
    super(props)
    this.nav = this.props.navigation

    this.user = null
    this.state = {
      username: 'no username',
      spinner: false,
      showMap: true,
      switch: false,
      data: ['1', '2', '3', '4', '5', '6', '7']
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
  }


  render () {
    //switch for list view and map view
    //action sheet when pressing 
    return (
      <Container style={styles.container}>
      <Header />
      {this.state.spinner && <Spinner style={styles.spinner} />}
        <View style={{flexDirection: 'row', marginVertical: 10, justifyContent: 'flex-end'}}>
          <View style={{flexDirection: 'row'}}> 
            <Text>Map view:</Text>
            <Switch value={this.state.switch} onValueChange={(val)=> this.setState({switch: val})} />
          </View>
        </View>

        {!this.state.switch && <FlatList
          style={{marginHorizontal: 10}}
          data={this.state.data}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Card style={{padding: 10}}>
              <Text>{'Session ' + item}</Text>
              <Text>Placeholder text</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text>{"Location: Gym " + item}</Text>
                <TouchableOpacity>
                  <Text style={{color: 'blue'}}>View on map</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
      />}

        {this.state.switch && this.state.showMap && <MapView
          style={styles.map}
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
        </MapView>}

        <View style={{flexDirection: 'row'}}>
          <Button style={{width: '50%'}}
          onPress={()=> this.nav.navigate('SessionType')}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center'}}>Create Session</Text>
          </Button>
          <Button style={{width: '50%'}}
          onPress={()=> this.nav.navigate('SessionType')}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center'}}>Create Private Session</Text>
          </Button>
        </View>
      </Container>
      )
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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          showMap: true
        })
        Alert.alert("lat: " + position.coords.latitude, "lon: " + position.coords.longitude)
        this.setState({spinner: false})
      },
      (error) => {
        this.setState({ spinner: false })
        Alert.alert('Error', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000, /*maximumAge: 1000*/ },
    )
  }
}
