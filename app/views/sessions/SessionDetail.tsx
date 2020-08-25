import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import NumericInput from 'react-native-numeric-input';
import RadioForm from 'react-native-simple-radio-button';
import {connect} from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import {
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Geocoder from 'react-native-geocoder';
import database from '@react-native-firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNCalendarEvents from 'react-native-calendar-events';
import {geofire} from '../../App';

import styles from '../../styles/sessionDetailStyles';
import {types, getType, addSessionToCalendar} from '../../constants/utils';
import Header from '../../components/Header/header';
import MapModal from '../../components/MapModal';
import LocationSearchModal from '../../components/LocationSearchModal';
import Button from '../../components/Button';
import {addPost} from '../../actions/home';
import {fetchSessions} from '../../actions/sessions';
import SessionDetailProps from '../../types/views/sessions/SessionDetail';
import Session, {SessionType, Gender} from '../../types/Session';
import Place from '../../types/Place';

const genderProps = [
  {label: Gender.UNSPECIFIED, value: Gender.UNSPECIFIED},
  {label: Gender.MALE, value: Gender.MALE},
  {label: Gender.FEMALE, value: Gender.FEMALE},
];

const typeProps = types.map((type) => {
  return {label: type, value: type};
});

interface State {
  gender: Gender;
  formattedAddress: string;
  selectedDate: Date;
  date: Date;
  duration: number;
  durationMinutes: number;
  addToCalendar: boolean;
  type: SessionType;
  location: any;
  title?: string;
  details?: string;
  mapOpen?: boolean;
  searchOpen?: boolean;
  calendarId?: string;
  gym?: Place;
  showDatePicker?: boolean;
}
class SessionDetail extends Component<SessionDetailProps, State> {
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    const location = navigation.getParam('location');
    this.state = {
      gender: Gender.UNSPECIFIED,
      formattedAddress: 'none',
      date: new Date(),
      selectedDate: new Date(),
      duration: 1,
      durationMinutes: 0,
      addToCalendar: false,
      type: SessionType.CUSTOM,
      location,
    };
  }

  componentDidMount() {
    const {location} = this.state;
    if (location && location.geometry) {
      const coords = {
        lat: location.geometry.location.lat,
        lng: location.geometry.location.lng,
        gym: location.place_id ? location : null,
      };
      this.setLocation(coords, true);
    }
  }

  async setLocation(location, usingPosition = false) {
    if (usingPosition) {
      console.log('location', location);
      try {
        const res = await Geocoder.geocodePosition(location);
        this.setState({
          formattedAddress: res[0].formattedAddress,
          gym: location.gym,
          location: {...res[0]},
        });
      } catch (e) {
        Alert.alert('Error', 'Invalid location');
      }
    } else {
      try {
        const res = await Geocoder.geocodeAddress(location.postcode);
        this.setState({
          formattedAddress: res[0].formattedAddress,
          gym: location.gym,
          location: {...res[0]},
        });
      } catch (e) {
        Alert.alert('Error', 'Invalid location');
      }
    }
  }

  setLocationAsPosition() {
    Geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.setLocation(coords, true);
      },
      (error) => {
        Alert.alert('Error', error.message);
      },
      {enableHighAccuracy: true, timeout: 20000 /* maximumAge: 1000 */},
    );
  }

  static navigationOptions = {
    headerShown: false,
    tabBarIcon: ({tintColor}) => (
      <Icon size={25} name="md-home" style={{color: tintColor}} />
    ),
  };

  async createSession() {
    const {navigation, getSessions, profile} = this.props;
    const friends = navigation.getParam('friends');
    const {
      title,
      location,
      details,
      gym,
      gender,
      type,
      date,
      duration,
      durationMinutes,
      calendarId,
      addToCalendar,
    } = this.state;
    if (location && title && details && date) {
      const session: Session = {
        location,
        gym: gym && gym.place_id,
        title,
        details,
        gender,
        type,
        host: profile.uid,
        dateTime: date.toString(),
        duration,
        durationMinutes,
        users: {},
        private: false,
      };
      if (friends) {
        session.private = true;
        friends.forEach((uid) => {
          session.users[uid] = true;
        });
      }
      session.users[profile.uid] = true;

      try {
        const type = session.private ? 'privateSessions' : 'sessions';
        const val = session.private ? 'private' : true;
        const ref = database().ref(type).push();
        const {key} = ref;
        await ref.set(session);
        Alert.alert('Success', 'Session created');
        getSessions();
        navigation.navigate('Sessions');
        if (friends) {
          friends.forEach((friend) => {
            database().ref(`userSessions/${friend}`).child(key).set(val);
          });
        }
        database().ref(`${type}/${key}/users`).child(profile.uid).set(true);
        database().ref(`userSessions/${profile.uid}`).child(key).set(val);
        const coords = location.position;
        if (type === 'sessions') {
          geofire.set(key, [coords.lat, coords.lng]);
        }
        const systemMessage = {
          _id: 1,
          text: 'Beginning of chat',
          createdAt: new Date().toString(),
          system: true,
        };
        database().ref(`sessionChats/${key}`).push(systemMessage);
        if (addToCalendar) {
          await addSessionToCalendar(calendarId, session);
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    } else {
      Alert.alert('Error', 'Please enter all the necessary fields');
    }
  }

  render() {
    const {
      date,
      duration,
      durationMinutes,
      gym,
      formattedAddress,
      type,
      addToCalendar,
      mapOpen,
      searchOpen,
      showDatePicker,
      selectedDate,
    } = this.state;
    return (
      <>
        <Header title="Enter details" hasBack />
        <ScrollView style={{flex: 1}}>
          <TextInput
            style={{
              padding: 5,
              borderWidth: 0.5,
              borderColor: '#999',
              flex: 1,
              margin: 10,
              height: 50,
            }}
            underlineColorAndroid="transparent"
            onChangeText={(input) => this.setState({title: input})}
            placeholder="Title"
          />

          <TextInput
            style={{
              padding: 5,
              borderWidth: 0.5,
              borderColor: '#999',
              height: 100,
              margin: 10,
            }}
            placeholder="Details..."
            textAlignVertical="top"
            multiline
            underlineColorAndroid="transparent"
            onChangeText={(input) => this.setState({details: input})}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 10,
              marginBottom: 10,
              alignItems: 'center',
            }}>
            <Button
              onPress={() => this.setState({showDatePicker: true})}
              text={moment(date).format('MMMM Do YYYY, h:mm')}
            />
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginBottom: 20,
                marginTop: 10,
                alignItems: 'center',
              }}>
              <Text style={{marginRight: 5}}>Add to calendar</Text>
              <Switch
                value={addToCalendar}
                onValueChange={async (val) => {
                  this.setState({addToCalendar: val});
                  try {
                    if (val) {
                      const result = await RNCalendarEvents.authorizeEventStore();
                      if (result === 'authorized') {
                        const calendars = await RNCalendarEvents.findCalendars();
                        const validList = calendars.filter(
                          (calendar) => calendar.allowsModifications,
                        );
                        if (validList && validList.length > 0) {
                          this.setState({calendarId: validList[0].id});
                        } else {
                          Alert.alert(
                            'Sorry',
                            "You don't have any calendars that allow modification",
                          );
                          this.setState({addToCalendar: false});
                        }
                      } else {
                        this.setState({addToCalendar: false});
                      }
                    } else {
                      this.setState({addToCalendar: false});
                    }
                  } catch (e) {
                    Alert.alert('Error', e.message);
                    this.setState({addToCalendar: false});
                  }
                }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 10,
              marginBottom: 10,
              alignItems: 'center',
            }}>
            <Text style={{color: '#999', textAlign: 'center', width: 40}}>
              For
            </Text>
            <NumericInput
              value={duration}
              onChange={(duration) => this.setState({duration})}
              onLimitReached={(isMax, msg) => console.log(isMax, msg)}
              totalWidth={75}
              totalHeight={40}
              iconSize={40}
              step={1}
              valueType="integer"
              rounded
              maxValue={24}
              minValue={0}
              // @ts-ignore
              iconStyle={{color: 'white'}}
            />
            <Text style={{color: '#999', width: 40, textAlign: 'center'}}>
              {duration === 1 ? 'hr' : 'hrs'}
            </Text>
            <NumericInput
              value={durationMinutes}
              onChange={(durationMinutes) => this.setState({durationMinutes})}
              onLimitReached={(isMax, msg) => console.log(isMax, msg)}
              totalWidth={75}
              totalHeight={40}
              iconSize={40}
              step={1}
              valueType="integer"
              rounded
              maxValue={59}
              minValue={0}
              // @ts-ignore
              iconStyle={{color: 'white'}}
            />
            <Text style={{color: '#999', width: 40, textAlign: 'center'}}>
              {durationMinutes === 1 ? 'min' : 'mins'}
            </Text>
          </View>

          <View
            style={{
              flex: 2,
              borderTopWidth: 0.5,
              borderBottomWidth: 0.5,
              borderColor: '#999',
            }}>
            <Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>
              Location
            </Text>
            <TouchableOpacity
              style={{
                padding: 10,
                margin: 10,
                borderWidth: 0.5,
                borderColor: '#999',
              }}
              onPress={() => this.setState({searchOpen: true})}>
              <Text style={{color: '#999'}}>Search...</Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Button
                style={{margin: 10}}
                onPress={() => this.setLocationAsPosition()}
                text="Use my location"
              />
              <Button
                style={{margin: 10}}
                onPress={() => this.setState({mapOpen: true})}
                text="Select from map"
              />
            </View>
            <Text style={{alignSelf: 'center', margin: 10, fontSize: 15}}>
              {`Selected location:  ${gym ? gym.name : formattedAddress}`}
            </Text>
          </View>
          <Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>
            Gender
          </Text>
          <RadioForm
            formHorizontal
            radio_props={genderProps}
            initial={0}
            style={{padding: 10, borderBottomWidth: 0.5, borderColor: '#999'}}
            labelStyle={{marginRight: 20}}
            onPress={(value) => {
              this.setState({gender: value});
            }}
          />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 20, margin: 10, fontWeight: 'bold'}}>
              Type
            </Text>
            {getType(type, 20)}
          </View>
          <RadioForm
            formHorizontal
            radio_props={typeProps}
            initial={0}
            style={{
              padding: 10,
              borderBottomWidth: 0.5,
              borderColor: '#999',
              flexWrap: 'wrap',
            }}
            labelStyle={{marginRight: 20}}
            onPress={(value) => this.setState({type: value})}
          />
          <Button
            style={{alignSelf: 'center', marginVertical: 20}}
            onPress={() => this.createSession()}
            text="Create Session">
            Create Session
          </Button>
        </ScrollView>

        <MapModal
          isOpen={mapOpen}
          onClosed={() => this.setState({mapOpen: false})}
          handlePress={(location) => {
            this.setState({mapOpen: false});
            this.setLocation(location, true);
          }}
        />
        <LocationSearchModal
          onPress={(details) => {
            const location: any = {};
            try {
              details.address_components.forEach((component) => {
                if (component.types[0] === 'postal_code') {
                  location.postcode = Object.values(component)[0];
                }
              });
              if (location.postcode) {
                if (details.types && details.types.includes('gym')) {
                  location.gym = details;
                }
                this.setLocation(location);
                this.setState({searchOpen: false});
              } else {
                throw Error('Could not find postcode of location');
              }
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }}
          onClosed={() => this.setState({searchOpen: false})}
          isOpen={searchOpen}
        />
        {showDatePicker && (
          <SafeAreaView>
            <DateTimePicker
              value={selectedDate}
              mode="datetime"
              onChange={(event, newDate) => {
                if (newDate && Platform.OS === 'android') {
                  this.setState({
                    selectedDate: newDate,
                    date: newDate,
                    showDatePicker: false,
                  });
                } else if (newDate) {
                  this.setState({selectedDate: newDate});
                }
              }}
              minimumDate={new Date()}
            />
            {Platform.OS === 'ios' && (
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() =>
                    this.setState({
                      showDatePicker: false,
                    })
                  }>
                  <Text style={{fontSize: 16}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{padding: 10}}
                  onPress={() =>
                    this.setState({showDatePicker: false, date: selectedDate})
                  }>
                  <Text>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        )}
      </>
    );
  }
}

const mapStateToProps = ({profile}) => ({
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch) => ({
  createPost: (post) => dispatch(addPost(post)),
  getSessions: () => dispatch(fetchSessions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionDetail);
