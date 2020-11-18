import React, {FunctionComponent, useEffect, useState} from 'react';
import {pathOr} from 'ramda';
import {Alert, View, TouchableOpacity, Image as SlowImage} from 'react-native';
import MapView, {Marker, MapEvent} from 'react-native-maps';
import {connect} from 'react-redux';
import Slider from '@react-native-community/slider';
import Image from 'react-native-fast-image';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import styles from '../../styles/sessionStyles';
import {getDistance} from '../../constants/utils';
import {
  fetchSessions,
  fetchPrivateSessions,
  setRadius,
  SetShowFilterModal,
  fetchPhotoPath,
} from '../../actions/sessions';
import Place from '../../types/Place';
import globalStyles from '../../styles/globalStyles';
import {
  CheckBox,
  Text,
  Layout,
  List,
  ListItem,
  Divider,
  Spinner,
  Modal,
  Card,
} from '@ui-kitten/components';
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from '@react-native-firebase/admob';
import str from '../../constants/strings';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import ThemedImage from '../../components/ThemedImage/ThemedImage';
import Avatar from '../../components/Avatar/Avatar';
import {GOOGLE_API_KEY} from '../../constants/strings';
import FriendsModal from '../../components/friendsModal';
import GymsProps from '../../types/views/sessions/Gyms';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : str.admobInterstitial;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: str.keywords,
});

const Gyms: FunctionComponent<GymsProps> = ({
  radius: currentRadius,
  saveRadius,
  places,
  fetch,
  location,
  navigation,
  setShowFilterModal,
  showFilterModal,
  gym,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [popUpVisible, setPopUpVisible] = useState(false);
  const [pilates, setPilates] = useState(true);
  const [yoga, setYoga] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [loadMoreGyms, setLoadMoreGyms] = useState(true);
  const [stateToken, setStateToken] = useState<string>();
  const [radius, setStateRadius] = useState<number>(currentRadius);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const eventListener = interstitial.onAdEvent((type) => {
      if (type === AdEventType.LOADED) {
        setLoaded(true);
      }
    });
    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      eventListener();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch(radius);
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

  const gymFilter = (gym: Place) => {
    return (
      pilates &&
      !gym.name.toLowerCase().includes('pilates') &&
      yoga &&
      !gym.name.toLowerCase().includes('yoga')
    );
  };

  const renderLists = () => {
    const yourLat = pathOr(null, ['lat'], location);
    const yourLon = pathOr(null, ['lon'], location);
    return (
      <>
        <GooglePlacesAutocomplete
          onPress={async (data, details) => {
            setSpinner(true);
            const {lat, lng} = details.geometry.location;
            if (details && details.types && details.types.includes('gym')) {
              const gym = await fetchPhotoPath(details);
              const marker = (
                <Marker
                  key={gym.place_id}
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  onPress={(event) => {
                    event.stopPropagation();
                    setSelectedLocation(gym);
                    navigation.navigate('Gym', {id: gym.place_id});
                  }}
                />
              );
              setSelectedLocation(gym);
              // setMarkers([...markers, marker]);
              setSpinner(false);
              navigation.navigate('Gym', {id: gym.place_id});
            } else {
              Alert.alert(
                'Location selected not recognised as a gym, please contact support if you think this is incorrect',
              );
            }
          }}
          styles={{
            container: {
              flex: 0,
              position: 'absolute',
              width: '100%',
              zIndex: 9,
            },
          }}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: GOOGLE_API_KEY,
            language: 'en', // language of the results
            types: 'establishment', // default: 'geocode'
          }}
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance',
            types: 'gym',
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          placeholder="Search for your gym..."
          debounce={500}
          minLength={2} // minimum length of text to search
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails
        />

        <Layout style={{flex: 1, marginTop: 45}}>
          {gym && (
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
                    style={{marginRight: 10}}
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

          <List
            data={sortPlacesByDistance(Object.values(places))}
            refreshing={refreshing}
            ItemSeparatorComponent={Divider}
            // onEndReached={async () => {
            //   if (!spinner && loadMoreGyms) {
            //     setRefreshing(true);
            //     const {token: newToken, loadMore} = await getPlaces(
            //       yourLat,
            //       yourLon,
            //       stateToken,
            //     );
            //     setRefreshing(false);
            //     setStateToken(newToken);
            //     setLoadMoreGyms(loadMore);
            //   }
            // }}
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
                        <Avatar uri={item.photo} size={40} />
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
                            navigation.navigate('Map', {lat, lng});
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
        </Layout>
      </>
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
                    onPress={() => setYoga(!yoga)}
                    style={{marginRight: 20, marginVertical: 10}}
                  />
                  <Text>Show Yoga</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPilates(!pilates)}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <CheckBox
                    checked={pilates}
                    onPress={() => setPilates(!pilates)}
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
  saveRadius: (radius: number) => dispatch(setRadius(radius)),
  setShowFilterModal: (show: boolean) => dispatch(SetShowFilterModal(show)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Gyms);
