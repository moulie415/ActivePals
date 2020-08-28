import React, {
  Component,
  FunctionComponent,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {pathOr} from 'ramda';
import Geolocation from '@react-native-community/geolocation';
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  Image as SlowImage,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Modal from 'react-native-modalbox';
import {Popup, Options} from 'react-native-map-link';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import MapView, {Marker, MapEvent} from 'react-native-maps';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import {connect} from 'react-redux';
import Slider from '@react-native-community/slider';
import Image from 'react-native-fast-image';
import styles from '../../styles/sessionStyles';
import {
  getType,
  formatDateTime,
  getDistance,
  sortSessionsByDistance,
} from '../../constants/utils';
import FriendsModal from '../../components/friendsModal';
import GymSearch from '../../components/GymSearch';
import PrivateIcon from '../../components/PrivateIcon';
import {fetchSessionChats} from '../../actions/chats';
import {
  fetchSessions,
  fetchPrivateSessions,
  removeSession,
  setPlaces,
  fetchPlaces,
  setRadius,
  SetShowMap,
  SetShowFilterModal,
} from '../../actions/sessions';
import {removeGym, joinGym, setLocation} from '../../actions/profile';
import SessionsProps from '../../types/views/sessions/Sessions';
import Session from '../../types/Session';
import Place from '../../types/Place';
import globalStyles from '../../styles/globalStyles';
import {
  CheckBox,
  Button,
  Text,
  Layout,
  List,
  ListItem,
  Divider,
  Avatar,
  Spinner,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import ThemedImage from '../../components/ThemedImage/ThemedImage';
import {YourLocation} from '../../types/Location';
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from '@react-native-firebase/admob';
import str from '../../constants/strings';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : str.admobInterstitial;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['fashion', 'clothing'],
});

const LOCATION_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const Sessions: FunctionComponent<SessionsProps> = ({
  sessions: propsSessions,
  privateSessions,
  radius: currentRadius,
  saveRadius,
  setYourLocation,
  getPlaces,
  places,
  fetch,
  location,
  navigation,
  setShowFilterModal,
  setShowMap,
  showFilterModal,
  showMap,
  gym,
  friends,
}) => {
  const getMarkers = (sessions: Session[]) => {
    return sessions.map((session) => {
      const {lng} = session.location.position;
      const {lat} = session.location.position;
      return (
        <Marker
          key={session.key}
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          onPress={(event) => {
            event.stopPropagation();
            setLatitude(lat);
            setLongitude(lng);
            Alert.alert(`View session ${session.title}?`, '', [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'OK',
                onPress: () =>
                  navigation.navigate('SessionInfo', {
                    sessionId: session.key,
                    isPrivate: session.private,
                  }),
              },
            ]);
          }}>
          {getType(session.type, 40)}
        </Marker>
      );
    });
  };
  const sessions = sortSessionsByDistance([
    ...Object.values(propsSessions),
    ...Object.values(privateSessions),
  ]);

  const ActionSheetRef = useRef<ActionSheet>(null);
  const [spinner, setSpinner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markers, setMarkers] = useState<Element[]>(getMarkers(sessions));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [pilates, setPilates] = useState(true);
  const [yoga, setYoga] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [loadMoreGyms, setLoadMoreGyms] = useState(true);
  const [stateToken, setStateToken] = useState<string>();
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [radius, setStateRadius] = useState<number>(currentRadius);

  const getPosition = useCallback(async () => {
    setSpinner(true);
    const response = await Permissions.request(LOCATION_PERMISSION);
    // to watch position:
    // this.watchID = navigator.geolocation.watchPosition((position) => {
    if (response === RESULTS.GRANTED) {
      return Geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setYourLocation({lat, lon});
          setLatitude(lat);
          setLongitude(lon);
          setSpinner(false);
        },
        (error) => {
          setSpinner(false);
          Alert.alert('Error', error.message);
        },
        {enableHighAccuracy: true, timeout: 20000 /* , maximumAge: 1000 */},
      );
    } else {
      Alert.alert(
        'Can we access your location?',
        'We need access to help find sessions near you',
        [
          {
            text: 'No way',
            onPress: () => console.log('Permission denied'),
            style: 'cancel',
          },
          response === RESULTS.BLOCKED
            ? {
                text: 'OK',
                onPress: () => Permissions.request(LOCATION_PERMISSION),
              }
            : {text: 'Open Settings', onPress: Permissions.openSettings},
        ],
      );
    }
  }, [setYourLocation]);

  useEffect(() => {
    const getNewPlaces = async () => {
      if (latitude && longitude) {
        const {token} = await getPlaces(latitude, longitude, stateToken);
        setStateToken(token);
      }
    };
    getNewPlaces();
  }, [latitude, longitude, getPlaces, stateToken]);

  useEffect(() => {
    const eventListener = interstitial.onAdEvent((type) => {
      if (type === AdEventType.LOADED) {
        setLoaded(true);
      }
    });
    // Start loading the interstitial straight away
    interstitial.load();
    getPosition();
    // Unsubscribe from events on unmount
    return () => {
      eventListener();
    };
  }, [getPosition]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setMarkers([]);
    await fetch(radius);
    await getPosition();
    setRefreshing(false);
  };

  const sortPlacesByDistance = (places: Place[]): Place[] => {
    if (location) {
      const {lat, lon} = location;
      return places.sort((a, b) => {
        const distance1 = getDistance(a, lat, lon, true);
        const distance2 = getDistance(b, lat, lon, true);
        return distance1 - distance2;
      });
    }
    return places;
  };

  const handlePress = (event: MapEvent) => {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;
    const loc = {geometry: {location: {lat, lng}}};
    setSelectedLocation(loc);
    setLatitude(lat);
    setLongitude(lng);
    ActionSheetRef.current?.show();
  };

  const gymMarkers = (results: Place[]) => {
    return results.map((result) => {
      if (result.geometry) {
        const {lat} = result.geometry.location;
        const {lng} = result.geometry.location;
        return (
          <Marker
            key={result.place_id}
            coordinate={{
              latitude: lat,
              longitude: lng,
            }}
            onPress={(event) => {
              event.stopPropagation();
              setSelectedLocation(result);
              setLatitude(lat);
              setLongitude(lng);
              Alert.alert(`View gym ${result.name}?`, '', [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'OK',
                  onPress: () =>
                    navigation.navigate('Gym', {id: result.place_id}),
                },
              ]);
            }}
          />
        );
      }
    });
  };

  const gymFilter = (gym: Place) => {
    return (
      pilates &&
      !gym.name.toLowerCase().includes('pilates') &&
      yoga &&
      !gym.name.toLowerCase().includes('yoga')
    );
  };

  const renderLists = () => {
    const emptyComponent = (
      <Text
        style={{
          textAlign: 'center',
          marginHorizontal: 20,
        }}>
        No sessions near you have been created yet, also please make sure you
        are connected to the internet
      </Text>
    );
    const yourLat = pathOr(null, ['lat'], location);
    const yourLon = pathOr(null, ['lon'], location);
    return (
      <Layout style={{flex: 1, marginTop: 45}}>
        <SegmentedControlTab
          values={['Sessions', 'Gyms near you']}
          selectedIndex={selectedIndex}
          onTabPress={(index) => setSelectedIndex(index)}
          tabsContainerStyle={{marginHorizontal: 8, marginVertical: 5}}
        />
        {gym && selectedIndex === 1 && (
          <ListItem
            title="Your gym"
            description={gym.name}
            onPress={() =>
              navigation.navigate('Messaging', {gymId: gym.place_id})
            }
            accessoryLeft={() =>
              gym.photo ? (
                <Image
                  source={{uri: gym.photo}}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                  }}
                />
              ) : (
                <ThemedImage
                  source={require('../../../assets/images/dumbbell.png')}
                  size={40}
                />
              )
            }
            accessoryRight={() => (
              <>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Messaging', {gymId: gym.place_id})
                  }>
                  <ThemedIcon name="message-square" size={25} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Gym', {id: gym.place_id})
                  }>
                  <ThemedIcon name="info" size={25} />
                </TouchableOpacity>
              </>
            )}
          />
        )}
        {selectedIndex === 0 ? (
          <List
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={[
              {flexGrow: 1},
              sessions.length > 0 ? null : {justifyContent: 'center'},
            ]}
            ItemSeparatorComponent={Divider}
            ListEmptyComponent={emptyComponent}
            data={sessions}
            keyExtractor={(item) => item.key}
            renderItem={({item}) => (
              <ListItem
                onPress={() =>
                  navigation.navigate('SessionInfo', {
                    sessionId: item.key,
                    isPrivate: item.private,
                  })
                }
                title={`${item.title} (${
                  item.distance
                    ? item.distance.toFixed(2)
                    : getDistance(item, yourLat, yourLon).toFixed(2)
                } km away)`}
                description={item.details}
                accessoryLeft={() => getType(item.type, 40)}
                accessoryRight={() => {
                  return (
                    <>
                      {item.private && <PrivateIcon size={25} />}
                      <TouchableOpacity
                        onPress={() => {
                          setLongitude(item.location.position.lng);
                          setLatitude(item.location.position.lat);
                          setShowMap(true);
                        }}>
                        <ThemedIcon name="pin" size={40} />
                      </TouchableOpacity>
                    </>
                  );
                }}
              />
            )}
          />
        ) : (
          <List
            data={sortPlacesByDistance(Object.values(places))}
            refreshing={refreshing}
            ItemSeparatorComponent={Divider}
            onEndReached={async () => {
              if (!spinner && loadMoreGyms) {
                setRefreshing(true);
                const {token: newToken, loadMore} = await getPlaces(
                  yourLat,
                  yourLon,
                  stateToken,
                );
                setRefreshing(false);
                setStateToken(newToken);
                setLoadMoreGyms(loadMore);
              }
            }}
            onEndReachedThreshold={0.1}
            onRefresh={handleRefresh}
            keyExtractor={(item) => item.place_id}
            renderItem={({item}) => {
              const {lat, lng} = item.geometry.location;
              if (gymFilter(item)) {
                return (
                  <ListItem
                    onPress={() => {
                      setSelectedLocation(item);
                      setLatitude(lat);
                      setLongitude(lng);
                      navigation.navigate('Gym', {id: item.place_id});
                    }}
                    title={`${item.name}  (${getDistance(
                      item,
                      yourLat,
                      yourLon,
                      true,
                    ).toFixed(2)} km away)`}
                    description={item.vicinity}
                    accessoryLeft={() => {
                      return item.photo ? (
                        <Avatar source={{uri: item.photo}} />
                      ) : (
                        <ThemedImage
                          source={require('../../../assets/images/dumbbell.png')}
                          size={40}
                        />
                      );
                    }}
                    accessoryRight={() => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setLongitude(lng);
                            setLatitude(lat);
                            setShowMap(true);
                          }}>
                          <ThemedIcon size={40} name="pin" />
                        </TouchableOpacity>
                      );
                    }}
                  />
                );
              }
              return null;
            }}
          />
        )}
      </Layout>
    );
  };

  return (
    <Layout style={{flex: 1}}>
      {spinner ? (
        <View style={globalStyles.indicator}>
          <Spinner />
        </View>
      ) : (
        <Layout style={{flex: 1}}>
          {!showMap && renderLists()}
          {showMap && (
            <MapView
              style={styles.map}
              onPress={handlePress}
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
              }}>
              {markers}
              {gymMarkers(Object.values(places))}
            </MapView>
          )}
          <GymSearch
            setSelectedLocation={setSelectedLocation}
            setLongitude={setLongitude}
            setLatitude={setLatitude}
            setMarkers={setMarkers}
            markers={markers}
            setSpinner={setSpinner}
            onOpen={(id) => navigation.navigate('Gym', {id})}
          />
          <View
            style={{
              flexDirection: 'row',
              height: 60,
              justifyContent: 'space-evenly',
            }}>
            <Button
              style={styles.button}
              onPress={() => {
                setSelectedLocation({});
                if (loaded) {
                  interstitial.show();
                }
                navigation.navigate('SessionDetail', {});
              }}>
              Create Session
            </Button>
            {/* <View style={{borderRightWidth: 1}} /> */}
            <Button
              style={styles.button}
              onPress={() => {
                if (Object.keys(friends).length > 0) {
                  setSelectedLocation({});
                  setFriendsModalOpen(true);
                } else {
                  Alert.alert(
                    'Sorry',
                    'You must have at least one pal to create a private session',
                  );
                }
              }}>
              Create Private Session
            </Button>
          </View>
          <FriendsModal
            onClosed={() => setFriendsModalOpen(false)}
            onContinue={(f) => {
              if (loaded) {
                interstitial.show();
              }
              navigation.navigate('SessionDetail', {
                friends: f,
                location: selectedLocation,
              });
            }}
            isOpen={friendsModalOpen}
          />
          <Modal
            useNativeDriver
            onClosed={async () => {
              setShowFilterModal(false);
              if (radius !== currentRadius) {
                setRefreshing(true);
                saveRadius(radius);
                await fetch(radius);
                setRefreshing(false);
              }
            }}
            style={styles.modal}
            position="center"
            isOpen={showFilterModal}
            key={showFilterModal ? 1 : 2}>
            <View style={{flex: 1, borderRadius: 5}}>
              <Text style={styles.sessionFilterTitle}>Sessions</Text>
              <View style={styles.sessionFilterContainer}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      marginRight: 5,
                      fontSize: 12,
                    }}>{`Search radius* ${radius} km`}</Text>
                  <Slider
                    maximumValue={50}
                    minimumValue={5}
                    step={5}
                    style={{flex: 1}}
                    value={radius}
                    onValueChange={setStateRadius}
                  />
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                  <Text style={{fontSize: 12, textAlign: 'right', margin: 10}}>
                    *Public only (private sessions should always be visible)
                  </Text>
                </View>
              </View>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 20,
                  textAlign: 'center',
                  padding: 10,
                  color: '#000',
                  fontWeight: 'bold',
                }}>
                Gyms
              </Text>
              <TouchableOpacity
                onPress={() => setYoga(!yoga)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 0.5,
                  borderTopColor: '#999',
                }}>
                <CheckBox checked={yoga} onPress={() => setYoga(!yoga)} />
                <Text>Show Yoga</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPilates(!pilates)}
                style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  checked={pilates}
                  onPress={() => setPilates(!pilates)}
                />
                <Text>Show Pilates</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Popup
            isVisible={popUpVisible}
            onCancelPressed={() => setPopUpVisible(false)}
            onAppPressed={() => setPopUpVisible(false)}
            onBackButtonPressed={() => setPopUpVisible(false)}
            modalProps={{animationIn: 'slideInUp'}}
            //options={options}
            appsWhiteList={[]}
          />
        </Layout>
      )}
      <ActionSheet
        ref={ActionSheetRef}
        title="Create session at location?"
        options={['Create session', 'Create private session', 'Cancel']}
        cancelButtonIndex={2}
        onPress={(index) => {
          if (index === 0) {
            //showAdmobInterstitial();
            navigation.navigate('SessionDetail', {
              location: selectedLocation,
            });
          } else if (index === 1) {
            if (Object.values(friends).length > 0) {
              setFriendsModalOpen(true);
            } else {
              Alert.alert(
                'Sorry',
                'You must have at least one pal to create a private session',
              );
            }
          }
        }}
      />
    </Layout>
  );
};

const mapStateToProps = ({
  friends,
  profile,
  chats,
  sessions,
  sharedInfo,
}: MyRootState) => ({
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
  showMap: sessions.showMap,
  showFilterModal: sessions.showFilterModal,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  join: (location) => dispatch(joinGym(location)),
  removeGym: () => dispatch(removeGym()),
  getChats: (sessions, uid: string) =>
    dispatch(fetchSessionChats(sessions, uid)),
  remove: (key: string, type) => dispatch(removeSession(key, type)),
  fetch: () =>
    Promise.all([dispatch(fetchSessions()), dispatch(fetchPrivateSessions())]),
  setYourLocation: (location: YourLocation) => dispatch(setLocation(location)),
  setPlaces: (places: Place[]) => dispatch(setPlaces(places)),
  getPlaces: (lat: number, lon: number, token?: string) =>
    dispatch(fetchPlaces(lat, lon, token)),
  saveRadius: (radius: number) => dispatch(setRadius(radius)),
  setShowMap: (show: boolean) => dispatch(SetShowMap(show)),
  setShowFilterModal: (show: boolean) => dispatch(SetShowFilterModal(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);
