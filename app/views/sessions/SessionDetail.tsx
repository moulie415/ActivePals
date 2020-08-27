import React, {Component} from 'react';
import NumericInput from 'react-native-numeric-input';
import {connect} from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import {
  View,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Geocoder from 'react-native-geocoder';
import database from '@react-native-firebase/database';
// import DateTimePicker from '@react-native-community/datetimepicker';
import RNCalendarEvents from 'react-native-calendar-events';
import {geofire} from '../../App';
import {types, getType, addSessionToCalendar} from '../../constants/utils';
import MapModal from '../../components/MapModal';
import LocationSearchModal from '../../components/LocationSearchModal';
import {addPost} from '../../actions/home';
import {fetchSessions} from '../../actions/sessions';
import SessionDetailProps from '../../types/views/sessions/SessionDetail';
import Session, {SessionType, Gender} from '../../types/Session';
import Place from '../../types/Place';
import {
  Button,
  Text,
  Layout,
  Radio,
  RadioGroup,
  Toggle,
  Input,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';

const genders = [Gender.UNSPECIFIED, Gender.MALE, Gender.FEMALE];

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
  selectedGender: number;
  selectedType: number;
}
class SessionDetail extends Component<SessionDetailProps, State> {
  constructor(props) {
    super(props);
    const {navigation, route} = this.props;
    const {location} = route.params;
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
      selectedGender: 0,
      selectedType: 0,
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

  async createSession() {
    const {navigation, getSessions, profile, route} = this.props;
    const {friends} = route.params;
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
      details,
      title,
      location,
    } = this.state;
    return (
      <Layout style={{flex: 1}}>
        <ScrollView style={{flex: 1}}>
          <View style={{margin: 10}}>
            <Input
              style={{ marginBottom: 10}}
              underlineColorAndroid="transparent"
              onChangeText={(input) => this.setState({title: input})}
              placeholder="Title"
            />
            <Input
              placeholder="Details..."
              textAlignVertical="top"
              textStyle={{minHeight: 64}}
              multiline
              underlineColorAndroid="transparent"
              onChangeText={(input) => this.setState({details: input})}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 10,
              marginBottom: 10,
              alignItems: 'center',
            }}>
            <Button onPress={() => this.setState({showDatePicker: true})}>
              {moment(date).format('MMMM Do YYYY, h:mm')}
            </Button>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 10,
                marginBottom: 20,
                marginTop: 10,
                alignItems: 'center',
              }}>
              <Text style={{marginRight: 5}}>Add to calendar</Text>
              <Toggle
                checked={addToCalendar}
                onChange={async (val) => {
                  this.setState({addToCalendar: val});
                  try {
                    if (val) {
                      const result = await RNCalendarEvents.requestPermissions();
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
              justifyContent: 'space-evenly',
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
            />
            <Text style={{textAlign: 'center'}}>
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
            <Text style={{margin: 10}}>Location</Text>
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
                onPress={() => this.setLocationAsPosition()}>
                Use my location
              </Button>
              <Button
                style={{margin: 10}}
                onPress={() => this.setState({mapOpen: true})}>
                Select from map
              </Button>
            </View>
            <Text style={{alignSelf: 'center', margin: 10}}>
              {`Selected location:  ${gym ? gym.name : formattedAddress}`}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',

              justifyContent: 'space-evenly',
            }}>
            <Text style={{margin: 10}}>Gender</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{margin: 10}}>Type</Text>
              {getType(types[this.state.selectedType], 20)}
            </View>
          </View>

          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <RadioGroup
              onChange={(index) => this.setState({selectedGender: index})}
              selectedIndex={this.state.selectedGender}>
              {genders.map((gender) => (
                <Radio>{gender}</Radio>
              ))}
            </RadioGroup>

            <RadioGroup
              onChange={(index) => this.setState({selectedType: index})}
              selectedIndex={this.state.selectedType}>
              {types.map((type) => (
                <Radio>{type}</Radio>
              ))}
            </RadioGroup>
          </View>
          <Button
            disabled={!(location && title && details && date)}
            style={{alignSelf: 'center', marginVertical: 20}}
            onPress={() => this.createSession()}>
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
            {/* <DateTimePicker
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
            /> */}
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
                  <Text>Cancel</Text>
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
      </Layout>
    );
  }
}

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  createPost: (post) => dispatch(addPost(post)),
  getSessions: () => dispatch(fetchSessions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionDetail);
