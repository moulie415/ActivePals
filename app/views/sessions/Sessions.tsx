import React, {FunctionComponent, useState, useEffect} from 'react';
import {pathOr} from 'ramda';
import Geolocation from '@react-native-community/geolocation';
import {
  Alert,
  View,
  TouchableOpacity,
  Platform,
  Image as SlowImage,
} from 'react-native';
import Permissions, {PERMISSIONS, RESULTS} from 'react-native-permissions';
import {connect} from 'react-redux';
import Slider from '@react-native-community/slider';
import styles from '../../styles/sessionStyles';
import {
  getType,
  getDistance,
  sortSessionsByDistance,
} from '../../constants/utils';
import FriendsModal from '../../components/friendsModal';
import {
  fetchSessions,
  fetchPrivateSessions,
  removeSession,
  setPlaces,
  fetchPlaces,
  setRadius,
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
  Spinner,
  Modal,
  Card,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import {YourLocation} from '../../types/Location';
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from '@react-native-firebase/admob';
import str from '../../constants/strings';
import useThrottle from '../../hooks/UseThrottle';
import PrivateIcon from '../../components/PrivateIcon';
import {logEvent} from '../../helpers/logging';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : str.admobInterstitial;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: str.keywords,
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
  fetch,
  location,
  navigation,
  setShowFilterModal,
  showFilterModal,
  friends,
}) => {
  const sessions = sortSessionsByDistance([
    ...Object.values(propsSessions),
    ...Object.values(privateSessions),
  ]);

  const [spinner, setSpinner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [popUpVisible, setPopUpVisible] = useState(false);
  const [pilates, setPilates] = useState(true);
  const [yoga, setYoga] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [loadMoreGyms, setLoadMoreGyms] = useState(true);
  const [stateToken, setStateToken] = useState<string>();
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [radius, setStateRadius] = useState<number>(currentRadius);

  const getPosition = useThrottle(async () => {
    setSpinner(true);
    try {
      const response = await Permissions.request(LOCATION_PERMISSION);
      // to watch position:
      // this.watchID = navigator.geolocation.watchPosition((position) => {
      if (response === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            setYourLocation({lat, lon});
            const {token} = await getPlaces(lat, lon, stateToken);
            //setStateToken(token);
            setSpinner(false);
          },
          (error) => {
            setSpinner(false);
            Alert.alert('Error', error.message);
          },
          {enableHighAccuracy: true, timeout: 20000 /* , maximumAge: 1000 */},
        );
      } else {
        setSpinner(false);
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
                  onPress: () => getPosition(),
                }
              : {text: 'Open Settings', onPress: Permissions.openSettings},
          ],
        );
      }
    } catch (e) {
      setSpinner(false);
    }
  }, 30000);

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
    await fetch(radius);
    await getPosition();
    setRefreshing(false);
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
      <Layout style={{flex: 1}}>
        <List
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
                        navigation.navigate('Map', {
                          lat: item.location.position.lat,
                          lng: item.location.position.lng,
                        });
                      }}>
                      <ThemedIcon name="pin" size={40} />
                    </TouchableOpacity>
                  </>
                );
              }}
            />
          )}
        />
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
          {renderLists()}

          <Layout
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
                  try {
                    interstitial.show();
                  } catch (e) {
                    
                    logEvent('ad_failed_to_load', {error: e.message});
                  }
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
          </Layout>
          <FriendsModal
            onClosed={() => setFriendsModalOpen(false)}
            onContinue={(f) => {
              if (loaded) {
                try {
                  interstitial.show();
                } catch (e) {
                  
                  logEvent('ad_failed_to_load', {error: e.message});
                }
              }
              setFriendsModalOpen(false);
              navigation.navigate('SessionDetail', {
                friends: f,
                location: selectedLocation,
              });
            }}
            isOpen={friendsModalOpen}
          />
          <Modal
            onBackdropPress={async () => {
              setShowFilterModal(false);
              if (radius !== currentRadius) {
                setRefreshing(true);
                saveRadius(radius);
                await fetch(radius);
                setRefreshing(false);
              }
            }}
            style={styles.modal}
            backdropStyle={globalStyles.backdrop}
            visible={showFilterModal}>
            <Card disabled>
              <View style={{flex: 1, borderRadius: 5}}>
                <Text style={styles.sessionFilterTitle}>Sessions</Text>
                <View style={styles.sessionFilterContainer}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text>{`Search radius* ${radius} km`}</Text>
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
                    <Text
                      appearance="hint"
                      style={{textAlign: 'right', margin: 10}}>
                      *Public only (private sessions should always be visible)
                    </Text>
                  </View>
                </View>
              </View>
              <Divider />
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                    padding: 10,
                    fontWeight: 'bold',
                  }}>
                  Gyms
                </Text>
                <TouchableOpacity
                  onPress={() => setYoga(!yoga)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    checked={yoga}
                    onChange={(val) => setYoga(val)}
                    style={{marginRight: 20, marginVertical: 10}}
                  />
                  <Text>Show Yoga</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPilates(!pilates)}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <CheckBox
                    checked={pilates}
                    onChange={(val) => setPilates(val)}
                    style={{marginRight: 20, marginVertical: 10}}
                  />
                  <Text>Show Pilates</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Modal>
          {/* <Popup
            isVisible={popUpVisible}
            onCancelPressed={() => setPopUpVisible(false)}
            onAppPressed={() => setPopUpVisible(false)}
            onBackButtonPressed={() => setPopUpVisible(false)}
            modalProps={{animationIn: 'slideInUp'}}
            //options={options}
            appsWhiteList={[]}
          /> */}
        </Layout>
      )}
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
  showFilterModal: sessions.showFilterModal,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  fetch: () =>
    Promise.all([dispatch(fetchSessions()), dispatch(fetchPrivateSessions())]),
  setYourLocation: (location: YourLocation) => dispatch(setLocation(location)),
  setPlaces: (places: Place[]) => dispatch(setPlaces(places)),
  getPlaces: (lat: number, lon: number, token?: string) =>
    dispatch(fetchPlaces(lat, lon, token)),
  saveRadius: (radius: number) => dispatch(setRadius(radius)),
  setShowFilterModal: (show: boolean) => dispatch(SetShowFilterModal(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);
