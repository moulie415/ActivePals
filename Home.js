import React, { Component } from "react"
import {
  StyleSheet,
  Alert,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar
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
import MapView from 'react-native-maps'


 export default class Home extends Component {

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

      {this.state.spinner && <Spinner style={styles.spinner} />}
        <Header style={{backgroundColor: colors.primary}}>
        <Left style={{flex: 1}} />
        <Title style={{alignSelf: 'center', flex: 1, color: '#fff'}}>Sessions</Title>
        <Right>
           <View style={{flexDirection: 'row', justifyContent: 'flex-end', flex: 1}}> 
            <Text style={{color: '#fff', fontFamily: 'Avenir'}}>Map: </Text>
            <Switch value={this.state.switch} onValueChange={(val)=> this.setState({switch: val})} />
          </View>
        </Right>

        </Header>
       

        {!this.state.switch && <FlatList
          //style={}
          data={this.state.data}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <View style={{padding: 10, backgroundColor: '#fff', marginBottom: 1}}>
                <View style={{flexDirection: 'row'}} >

                  <Image style={{height: 40, width: 40, marginRight: 10, alignSelf: 'center'}} 
                  source={require('./assets/images/dumbbell.png')}/>
                  <View style={{flex: 1}}>
                    <Text style={{fontFamily: 'Avenir'}}>{'Session ' + item}</Text>
                    <Text>Placeholder text</Text>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                      <Text style={{fontFamily: 'Avenir'}} >{"Location: Gym " + item}</Text>
                      <TouchableOpacity>
                        <Text style={{color: colors.secondary, fontFamily: 'Avenir'}}>View on map</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
      />}

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
        {this.markers()}
        </MapView>}

        <View style={{flexDirection: 'row'}}>
          <Button style={[styles.button]}
          onPress={()=> this.nav.navigate('SessionType')}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center', fontFamily: 'Avenir'}}>Create Session</Text>
          </Button>
          <View style={{borderRightWidth: 1, borderRightColor: '#fff'}}/> 
          <Button style={styles.button}
          onPress={()=> this.nav.navigate('SessionType')}>
            <Text adjustsFontSizeToFit={true} 
            style={{flex: 1, textAlign: 'center', fontFamily: 'Avenir'}}>Create Private Session</Text>
          </Button>
        </View>
      </Container>
      )
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

  markers() {
    
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
        //Alert.alert("lat: " + position.coords.latitude, "lon: " + position.coords.longitude)
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
