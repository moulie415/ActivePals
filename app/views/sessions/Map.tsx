import React, {FunctionComponent, useState, useEffect, useRef} from 'react';
import {View, Alert} from 'react-native';
import MapProps from '../../types/views/sessions/Map';
import MapView, {Marker, MapEvent} from 'react-native-maps';
import ActionSheet from 'react-native-actionsheet';
import {Spinner} from '@ui-kitten/components';
import {connect} from 'react-redux';
import {MyRootState} from '../../types/Shared';
import styles from '../../styles/sessionStyles';
import globalStyles from '../../styles/globalStyles';
import {getType} from '../../constants/utils';
import FriendsModal from '../../components/friendsModal';
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from '@react-native-firebase/admob';
import str from '../../constants/strings';
import {pathOr} from 'ramda';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : str.admobInterstitial;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: str.keywords,
});

const Map: FunctionComponent<MapProps> = ({
  navigation,
  location,
  sessions,
  privateSessions,
  places,
  friends,
  route,
}) => {
  const lat = pathOr(undefined, ['params', 'lat'], route);
  const lng = pathOr(undefined, ['params', 'lng'], route);
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const ActionSheetRef = useRef<ActionSheet>(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handlePress = (event: MapEvent) => {
    const lat = event.nativeEvent.coordinate.latitude;
    const lng = event.nativeEvent.coordinate.longitude;
    const loc = {geometry: {location: {lat, lng}}};
    setSelectedLocation(loc);
    setLatitude(lat);
    setLongitude(lng);
    ActionSheetRef.current?.show();
  };

  useEffect(() => {
    if ((lat && lng) || location) {
      if (lat && lng) {
        setLatitude(lat);
        setLongitude(lng);
      } else if (location) {
        setLatitude(location.lat);
        setLongitude(location.lon);
      }
    }
  }, [location, lat, lng]);

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

  if (longitude && latitude) {
    return (
      <>
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
          {[...Object.values(sessions), ...Object.values(privateSessions)].map(
            (session) => {
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
                  {getType(session.type, 40, '#222B45')}
                </Marker>
              );
            },
          )}
          {Object.values(places).map((place) => {
            if (place.geometry) {
              const {lat} = place.geometry.location;
              const {lng} = place.geometry.location;
              return (
                <Marker
                  key={place.place_id}
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  onPress={(event) => {
                    event.stopPropagation();
                    setSelectedLocation(place);
                    setLatitude(lat);
                    setLongitude(lng);
                    Alert.alert(`View gym ${place.name}?`, '', [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'OK',
                        onPress: () =>
                          navigation.navigate('Gym', {id: place.place_id}),
                      },
                    ]);
                  }}
                />
              );
            }
          })}
        </MapView>
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
        <ActionSheet
          ref={ActionSheetRef}
          title="Create session at location?"
          options={['Create session', 'Create private session', 'Cancel']}
          cancelButtonIndex={2}
          onPress={(index) => {
            if (index === 0) {
              if (loaded) {
                interstitial.show();
              }
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
      </>
    );
  }
  return (
    <View style={globalStyles.indicator}>
      <Spinner />
    </View>
  );
};

const mapStateToProps = ({
  friends,
  profile,
  sessions,
  sharedInfo,
}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
  users: sharedInfo.users,
  places: sessions.places,
  radius: sessions.radius,
  location: profile.location,
});

export default connect(mapStateToProps)(Map);
