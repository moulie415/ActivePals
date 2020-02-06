import React, { Component } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Modal from 'react-native-modalbox';
import { connect } from 'react-redux';
import Geocoder from 'react-native-geocoder';
import { Alert, View } from 'react-native';
import styles from './styles';
import Text from '../Text';
import Button from '../Button';

import colors from '../../constants/colors';
import MapModalProps from '../../types/components/MapsModal';
import Place from '../../types/Place';

interface State {
  latitude: number;
  longitude: number;
  text?: string;
  location?: { lat: number; lng: number; gym?: Place };
}

class MapModal extends Component<MapModalProps, State> {
  constructor(props) {
    super(props);
    const { location } = this.props;
    this.state = {
      text: 'Select location on map',
      latitude: location && location.lat,
      longitude: location && location.lng,
    };
  }

  render() {
    const { onClosed, isOpen, places, handlePress } = this.props;
    const { text, latitude, longitude, location } = this.state;
    return (
      <Modal position="center" style={styles.modal} onClosed={onClosed} isOpen={isOpen} swipeToClose={false}>
        <Text numberOfLines={1} style={{ padding: 10, alignSelf: 'center', fontSize: 20 }}>
          {text}
        </Text>
        <MapView
          style={{ flex: 1 }}
          onPress={async event => {
            event.stopPropagation();
            const lat = event.nativeEvent.coordinate.latitude;
            const lng = event.nativeEvent.coordinate.longitude;
            const l = { lat, lng };
            try {
              const res = await Geocoder.geocodePosition(location);
              this.setState({ text: res[0].formattedAddress, location: l, latitude: lat, longitude: lng });
            } catch (e) {
              Alert.alert('Error', 'Invalid location');
            }
          }}
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
          {Object.values(places).map(place => {
            const { lat } = place.geometry.location;
            const { lng } = place.geometry.location;
            return (
              <Marker
                key={place.place_id}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                pinColor={colors.secondary}
                onPress={event => {
                  event.stopPropagation();
                  this.setState({
                    text: place.name,
                    location: {
                      lat,
                      lng,
                      gym: place,
                    },
                    latitude: lat,
                    longitude: lng,
                  });
                }}
              />
            );
          })}
        </MapView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
          <Button style={{ alignSelf: 'center', marginVertical: 10 }} color="red" text="Cancel" onPress={onClosed} />
          {location && (
            <Button
              style={{ alignSelf: 'center', marginVertical: 10 }}
              text="Confirm"
              onPress={() => handlePress(location)}
            />
          )}
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = ({ profile, sessions }) => ({
  location: profile.location,
  places: sessions.places,
});

export default connect(mapStateToProps)(MapModal);
