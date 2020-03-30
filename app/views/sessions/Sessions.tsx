import React, { Component } from 'react';
import { pathOr } from 'ramda';
import Geolocation from '@react-native-community/geolocation';
import { Alert, View, FlatList, TouchableOpacity, Platform, Switch, Image as SlowImage } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Modal from 'react-native-modalbox';
import { CheckBox } from 'react-native-elements';
import { Popup, Options } from 'react-native-map-link';
import Permissions, { PERMISSIONS, RESULTS } from 'react-native-permissions';
import MapView, { Marker } from 'react-native-maps';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import Text from '../../components/Text';
import styles from '../../styles/sessionStyles';
import colors from '../../constants/colors';
import {
  getType,
  formatDateTime,
  getDistance,
  sortSessionsByDistance,
  showAdmobInterstitial,
} from '../../constants/utils';
import Header from '../../components/Header/header';
import FriendsModal from '../../components/friendsModal';
import GymSearch from '../../components/GymSearch';
import Button from '../../components/Button';
import PrivateIcon from '../../components/PrivateIcon';
import { fetchSessionChats } from '../../actions/chats';
import {
  fetchSessions,
  fetchPrivateSessions,
  removeSession,
  setPlaces,
  fetchPlaces,
  setRadius,
} from '../../actions/sessions';
import { removeGym, joinGym, setLocation } from '../../actions/profile';
import SessionsProps from '../../types/views/sessions/Sessions';
import Session from '../../types/Session';
import Place from '../../types/Place';
import globalStyles from '../../styles/globalStyles';

const LOCATION_PERMISSION =
  Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

interface State {
  radius: number;
  spinner: boolean;
  showMap: boolean;
  sessions: Session[];
  refreshing: boolean;
  markers: Element[];
  selectedIndex: number;
  popUpVisible: boolean;
  pilates: boolean;
  yoga: boolean;
  selectedLocation: {};
  locationPermission?: string;
  token?: string;
  longitude?: number;
  latitude?: number;
  friendsModalOpen?: boolean;
  options?: Options;
  filterModalOpen?: boolean;
  loadMoreGyms: boolean;
}
class Sessions extends Component<SessionsProps, State> {
  ActionSheet: ActionSheet;

  constructor(props) {
    super(props);
    const { sessions, privateSessions } = this.props;
    const combined = [...Object.values(sessions), ...Object.values(privateSessions)];

    this.state = {
      spinner: false,
      showMap: false,
      radius: props.radius,
      sessions: sortSessionsByDistance(combined),
      refreshing: false,
      markers: this.markers(combined),
      selectedIndex: 0,
      popUpVisible: false,
      pilates: true,
      yoga: true,
      selectedLocation: {},
      loadMoreGyms: true,
    };
  }

  async componentDidMount() {
    if (Platform.OS === 'ios') {
      this.locationPermission();
    } else {
      const response = await Permissions.check(LOCATION_PERMISSION);
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ locationPermission: response, spinner: true });
      if (response !== RESULTS.GRANTED) {
        this.alertForLocationPermission();
      } else {
        this.getPosition();
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.sessions || nextProps.privateSessions) {
      const sessions: Session[] = Object.values(nextProps.sessions);
      const privateSessions: Session[] = Object.values(nextProps.privateSessions);
      const combined = [...sessions, ...privateSessions];
      this.setState({ markers: this.markers(combined), sessions: sortSessionsByDistance(combined) });
    }
  }

  getPosition() {
    // to watch position:
    // this.watchID = navigator.geolocation.watchPosition((position) => {
    return Geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const { setYourLocation, getPlaces } = this.props;
        const { token: stateToken } = this.state;
        setYourLocation({ lat, lon });
        this.setState({
          latitude: lat,
          longitude: lon,
          spinner: false,
        });
        const { token } = await getPlaces(lat, lon, stateToken);
        this.setState({ token });
      },
      error => {
        this.setState({ spinner: false });
        Alert.alert('Error', error.message);
      },
      { enableHighAccuracy: true, timeout: 20000 /* , maximumAge: 1000 */ }
    );
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Sessions',
    tabBarIcon: ({ tintColor }) => (
      <SlowImage style={{ width: 30, height: 30, tintColor }} source={require('../../../assets/images/dumbbell.png')} />
    ),
  };

  async handleRefresh() {
    const { fetch } = this.props;
    const { radius } = this.state;
    this.setState({ refreshing: true, sessions: [], markers: [] });
    await fetch(radius);
    await this.getPosition();
    this.setState({ refreshing: false });
  }

  sortPlacesByDistance(places: Place[]): Place[] {
    const { location } = this.props;
    if (location) {
      const { lat, lon } = location;
      return places.sort((a, b) => {
        const distance1 = getDistance(a, lat, lon, true);
        const distance2 = getDistance(b, lat, lon, true);
        return distance1 - distance2;
      });
    }
    return places;
  }

  handlePress(event) {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;
    const location = { geometry: { location: { lat, lng } } };
    this.setState({ selectedLocation: location, latitude: lat, longitude: lng });
    this.ActionSheet.show();
  }

  markers(sessions: Session[]) {
    const { navigation } = this.props;
    return sessions.map(session => {
      const { lng } = session.location.position;
      const { lat } = session.location.position;
      return (
        <Marker
          key={session.key}
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          onPress={event => {
            event.stopPropagation();
            this.setState({ latitude: lat, longitude: lng }, () => {
              Alert.alert(`View session ${session.title}?`, '', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.navigate('SessionInfo', { sessionId: session.key, isPrivate: session.private }),
                },
              ]);
            });
          }}
        >
          {getType(session.type, 40)}
        </Marker>
      );
    });
  }

  // This is a common pattern when asking for permissions.
  // iOS only gives you once chance to show the permission dialog,
  // after which the user needs to manually enable them from settings.
  // The idea here is to explain why we need access and determine if
  // the user will say no, so that we don't blow our one chance.
  // If the user already denied access, we can ask them to enable it from settings.
  alertForLocationPermission() {
    const { locationPermission } = this.state;
    Alert.alert('Can we access your location?', 'We need access to help find sessions near you', [
      {
        text: 'No way',
        onPress: () => console.log('Permission denied'),
        style: 'cancel',
      },
      locationPermission === RESULTS.BLOCKED
        ? { text: 'OK', onPress: this.locationPermission }
        : { text: 'Open Settings', onPress: Permissions.openSettings },
    ]);
  }

  async locationPermission() {
    const response = await Permissions.request(LOCATION_PERMISSION);
    // Returns once the user has chosen to 'allow' or to 'not allow' access
    // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
    this.setState({ locationPermission: response });
    if (response === RESULTS.GRANTED) {
      this.getPosition();
    } else {
      Alert.alert(
        'Sorry',
        'The app does not have access to your location, some functionality may not work as a result'
      );
    }
  }

  gymMarkers(results) {
    const { navigation } = this.props;
    return results.map(result => {
      if (result.geometry) {
        const { lat } = result.geometry.location;
        const { lng } = result.geometry.location;
        return (
          <Marker
            key={result.place_id}
            coordinate={{
              latitude: lat,
              longitude: lng,
            }}
            pinColor={colors.secondary}
            onPress={event => {
              event.stopPropagation();
              this.setState({ selectedLocation: result, latitude: lat, longitude: lng }, () => {
                Alert.alert(`View gym ${result.name}?`, '', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'OK', onPress: () => navigation.navigate('Gym', { id: result.place_id }) },
                ]);
              });
            }}
          />
        );
      }
    });
  }

  gymFilter(gym) {
    const { yoga, pilates } = this.state;
    return pilates && !gym.name.toLowerCase().includes('pilates') && yoga && !gym.name.toLowerCase().includes('yoga');
  }

  renderLists() {
    const { gym, location, navigation, places } = this.props;
    const { selectedIndex, refreshing, sessions, token, spinner, loadMoreGyms } = this.state;
    const emptyComponent = (
      <View>
        <Text style={{ color: colors.primary, textAlign: 'center', marginHorizontal: 20 }}>
          No sessions near you have been created yet, also please make sure you are connected to the internet
        </Text>
      </View>
    );
    const yourLat = pathOr(null, ['lat'], location);
    const yourLon = pathOr(null, ['lon'], location);
    return (
      <View style={{ flex: 1, marginTop: 45 }}>
        <SegmentedControlTab
          values={['Sessions', 'Gyms near you']}
          selectedIndex={selectedIndex}
          onTabPress={index => {
            this.setState({ selectedIndex: index });
          }}
          tabsContainerStyle={{ marginHorizontal: 8, marginVertical: 5 }}
          tabStyle={{ borderColor: colors.secondary }}
          tabTextStyle={{ color: colors.secondary, fontFamily: 'Montserrat' }}
          activeTabStyle={{ backgroundColor: colors.secondary }}
        />
        {gym && selectedIndex === 1 && (
          <View style={{ padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.secondary }}>
            <View style={{ flexDirection: 'row' }}>
              {gym.photo ? (
                <Image
                  source={{ uri: gym.photo }}
                  style={{ height: 40, width: 40, alignSelf: 'center', borderRadius: 20, marginRight: 10 }}
                />
              ) : (
                <Image
                  source={require('../../../assets/images/dumbbell.png')}
                  style={{ height: 40, width: 40, alignSelf: 'center', marginRight: 10 }}
                />
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: colors.secondary }}>Your gym:</Text>
                    <Text>{gym.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Messaging', { gymId: gym.place_id })}
                      style={{ justifyContent: 'center', marginRight: 20 }}
                    >
                      <Icon name="md-chatboxes" size={25} style={{ color: colors.secondary }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Gym', { id: gym.place_id })}>
                      <Icon name="md-information-circle" size={25} style={{ color: colors.secondary }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
        {selectedIndex === 0 ? (
          <FlatList
            style={{ backgroundColor: '#9993' }}
            refreshing={refreshing}
            onRefresh={() => this.handleRefresh()}
            contentContainerStyle={[{ flexGrow: 1 }, sessions.length > 0 ? null : { justifyContent: 'center' }]}
            ListEmptyComponent={emptyComponent}
            data={sessions}
            keyExtractor={item => item.key}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('SessionInfo', { sessionId: item.key, isPrivate: item.private })}
              >
                <View
                  style={{
                    padding: 10,
                    backgroundColor: '#fff',
                    marginTop: 10,
                    marginHorizontal: 10,
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: colors.secondary,
                    // ...globalStyles.bubbleShadow,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ alignItems: 'center', marginRight: 10, justifyContent: 'center' }}>
                      {getType(item.type, 40)}
                    </View>
                    <View style={{ flex: 5 }}>
                      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <Text style={{ flex: 3 }} numberOfLines={1}>
                          <Text style={styles.title}>{`${item.title} `}</Text>
                          <Text style={{ color: '#999' }}>
                            {`(${
                              item.distance ? item.distance.toFixed(2) : getDistance(item, yourLat, yourLon).toFixed(2)
                            } km away)`}
                          </Text>
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.date, { color: item.inProgress ? colors.secondary : '#999' }]}>
                          {item.inProgress ? 'In progress' : formatDateTime(item.dateTime)}
                        </Text>
                        {item.private && <PrivateIcon size={25} />}
                      </View>
                      <Text style={{ flex: 2, color: '#000' }} numberOfLines={1}>
                        {item.location.formattedAddress}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({
                            longitude: item.location.position.lng,
                            latitude: item.location.position.lat,
                            showMap: true,
                          });
                        }}
                      >
                        <Icon name="ios-pin" size={40} style={{ color: colors.secondary }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={this.sortPlacesByDistance(Object.values(places))}
            refreshing={refreshing}
            onEndReached={async () => {
              if (!spinner && loadMoreGyms) {
                this.setState({ spinner: true });
                const { getPlaces } = this.props;
                const { token: newToken, loadMore } = await getPlaces(yourLat, yourLon, token);
                this.setState({ spinner: false, token: newToken, loadMoreGyms: loadMore });
              }
            }}
            onEndReachedThreshold={0.1}
            onRefresh={() => this.handleRefresh()}
            style={{ backgroundColor: '#9993' }}
            keyExtractor={item => item.place_id}
            renderItem={({ item, index }) => {
              const { lat, lng } = item.geometry.location;
              if (this.gymFilter(item)) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ selectedLocation: item, latitude: lat, longitude: lng }, () =>
                        navigation.navigate('Gym', { id: item.place_id })
                      );
                    }}
                  >
                    <View
                      style={{
                        padding: 10,
                        backgroundColor: '#fff',
                        marginTop: 10,
                        marginHorizontal: 10,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: colors.secondary,
                        // ...globalStyles.bubbleShadow,
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        {item.photo ? (
                          <Image
                            source={{ uri: item.photo }}
                            style={{ height: 40, width: 40, alignSelf: 'center', borderRadius: 20, marginRight: 10 }}
                          />
                        ) : (
                          <Image
                            source={require('../../../assets/images/dumbbell.png')}
                            style={{ height: 40, width: 40, alignSelf: 'center', marginRight: 10 }}
                          />
                        )}
                        <View style={{ flex: 5 }}>
                          <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Text style={[{ flex: 3 }, styles.title]} numberOfLines={1}>
                              {item.name}
                            </Text>
                          </View>
                          <Text style={{ flex: 2, color: '#000' }} numberOfLines={1}>
                            {item.vicinity}
                          </Text>
                          <Text style={{ color: '#999' }}>{` (${getDistance(item, yourLat, yourLon, true).toFixed(
                            2
                          )} km away)`}</Text>
                        </View>
                        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                          <TouchableOpacity
                            onPress={() => this.setState({ longitude: lng, latitude: lat, showMap: true })}
                          >
                            <Icon size={40} name="ios-pin" style={{ color: colors.secondary }} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
            }}
          />
        )}
      </View>
    );
  }

  render() {
    const {
      spinner,
      latitude,
      longitude,
      markers,
      showMap,
      friendsModalOpen,
      selectedLocation,
      radius,
      yoga: stateYoga,
      pilates: statePilates,
      popUpVisible,
      options,
      filterModalOpen,
    } = this.state;
    const { places, navigation, friends } = this.props;
    // switch for list view and map view
    // action sheet when pressing
    const left = (
      <TouchableOpacity
        style={{ position: 'absolute', top: 8, bottom: 0, left: 0, justifyContent: 'center', paddingLeft: 10 }}
        onPress={() => this.setState({ filterModalOpen: true })}
      >
        <Text style={{ color: '#fff' }}>Filters</Text>
      </TouchableOpacity>
    );
    const right = (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: '#fff' }}>Map: </Text>
        <Switch
          trackColor={{ true: colors.secondary, false: null }}
          thumbColor={Platform.select({ android: showMap ? colors.secondary : '#fff' })}
          value={showMap}
          onValueChange={val => {
            if (val) {
              if (latitude && longitude) {
                this.setState({ showMap: val });
              } else {
                Alert.alert('Error', 'Sorry your location could not be found');
              }
            } else {
              this.setState({ showMap: val });
            }
          }}
        />
      </View>
    );
    return (
      <>
        {spinner && <PulseIndicator color={colors.secondary} style={styles.spinner} />}
        <Header left={left} title="Sessions" right={right} />
        <View style={{ flex: 1 }}>
          {!showMap && this.renderLists()}
          {showMap && (
            <MapView
              style={styles.map}
              onPress={event => this.handlePress(event)}
              // onLongPress={event => this.handlePress(event)}
              showsUserLocation
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
              region={{
                latitude,
                longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              {markers}
              {this.gymMarkers(Object.values(places))}
            </MapView>
          )}
          <GymSearch parent={this} onOpen={id => navigation.navigate('Gym', { id })} />
          <View style={{ flexDirection: 'row', height: 60, backgroundColor: colors.bgColor }}>
            <Button
              style={styles.button}
              onPress={() => {
                this.setState({ selectedLocation: {} });
                showAdmobInterstitial();
                navigation.navigate('SessionDetail');
              }}
              text="Create Session"
              textStyle={{ textAlign: 'center', fontSize: 15, textAlignVertical: 'center' }}
            />
            <View style={{ borderRightWidth: 1, borderRightColor: colors.bgColor }} />
            <Button
              style={styles.button}
              onPress={() => {
                if (Object.keys(friends).length > 0) {
                  this.setState({ selectedLocation: {}, friendsModalOpen: true });
                } else {
                  Alert.alert('Sorry', 'You must have at least one pal to create a private session');
                }
              }}
              text="Create Private Session"
              textStyle={{ textAlign: 'center', fontSize: 15, textAlignVertical: 'center' }}
            />
          </View>
          <FriendsModal
            onClosed={() => this.setState({ friendsModalOpen: false })}
            onContinue={f => {
              showAdmobInterstitial();
              navigation.navigate('SessionDetail', { friends: f, location: selectedLocation });
            }}
            isOpen={friendsModalOpen}
          />
          <Modal
            onClosed={async () => {
              const { radius: currentRadius, fetch, saveRadius } = this.props;
              this.setState({ filterModalOpen: false });
              if (radius !== currentRadius) {
                this.setState({ refreshing: true });
                saveRadius(radius);
                await fetch(radius);
                this.setState({ refreshing: false });
              }
            }}
            style={styles.modal}
            position="center"
            isOpen={filterModalOpen}
            key={filterModalOpen ? 1 : 2}
          >
            <View style={{ flex: 1, borderRadius: 5 }}>
              <Text style={styles.sessionFilterTitle}>Sessions</Text>
              <View style={styles.sessionFilterContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ marginRight: 5, fontSize: 12 }}>{`Search radius* ${radius} km`}</Text>
                  <Slider
                    maximumValue={50}
                    minimumValue={5}
                    minimumTrackTintColor={colors.secondary}
                    thumbTintColor={colors.secondary}
                    step={5}
                    style={{ flex: 1 }}
                    value={radius}
                    onValueChange={val => this.setState({ radius: val })}
                  />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 12, textAlign: 'right', margin: 10 }}>
                    *Public only (private sessions should always be visible)
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, textAlign: 'center', padding: 10, color: '#000', fontWeight: 'bold' }}>
                Gyms
              </Text>
              <TouchableOpacity
                onPress={() => this.setState({ yoga: !stateYoga })}
                style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: '#999' }}
              >
                <CheckBox
                  containerStyle={{ backgroundColor: 'transparent', width: 45, borderWidth: 0 }}
                  checkedColor={colors.secondary}
                  uncheckedColor={colors.secondary}
                  checked={stateYoga}
                  onPress={() => this.setState({ yoga: !stateYoga })}
                />
                <Text>Show Yoga</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({ pilates: !statePilates })}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <CheckBox
                  containerStyle={{ backgroundColor: 'transparent', width: 45, borderWidth: 0 }}
                  checkedColor={colors.secondary}
                  uncheckedColor={colors.secondary}
                  checked={statePilates}
                  onPress={() => this.setState({ pilates: !statePilates })}
                />
                <Text>Show Pilates</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Popup
            isVisible={popUpVisible}
            onCancelPressed={() => this.setState({ popUpVisible: false })}
            onAppPressed={() => this.setState({ popUpVisible: false })}
            onBackButtonPressed={() => this.setState({ popUpVisible: false })}
            modalProps={{ animationIn: 'slideInUp' }}
            options={options}
            style={{
              cancelButtonText: { color: colors.secondary },
            }}
            appsWhiteList={[]}
          />
        </View>
        <ActionSheet
          ref={ref => {
            this.ActionSheet = ref;
          }}
          title="Create session at location?"
          options={['Create session', 'Create private session', 'Cancel']}
          cancelButtonIndex={2}
          onPress={index => {
            if (index === 0) {
              showAdmobInterstitial();
              navigation.navigate('SessionDetail', { location: selectedLocation });
            } else if (index === 1) {
              if (Object.values(friends).length > 0) {
                this.setState({ friendsModalOpen: true });
              } else {
                Alert.alert('Sorry', 'You must have at least one pal to create a private session');
              }
            }
          }}
        />
      </>
    );
  }
}

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
});

const mapDispatchToProps = dispatch => ({
  join: location => dispatch(joinGym(location)),
  removeGym: () => dispatch(removeGym()),
  getChats: (sessions, uid) => dispatch(fetchSessionChats(sessions, uid)),
  remove: (key, type) => dispatch(removeSession(key, type)),
  fetch: () => Promise.all([dispatch(fetchSessions()), dispatch(fetchPrivateSessions())]),
  setYourLocation: location => dispatch(setLocation(location)),
  setPlaces: places => dispatch(setPlaces(places)),
  getPlaces: (lat, lon, token) => dispatch(fetchPlaces(lat, lon, token)),
  saveRadius: radius => dispatch(setRadius(radius)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);
