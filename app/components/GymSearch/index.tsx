import React, { FunctionComponent } from 'react';
import { Alert } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Marker } from 'react-native-maps';
import { connect } from 'react-redux';
import colors from '../../constants/colors';
import { fetchPhotoPath } from '../../actions/sessions';
import styles from './styles';

const GooglePlacesInput: FunctionComponent = ({ parent, onOpen, googleApiKey }) => {
  return (
    <GooglePlacesAutocomplete
      style={{ flex: 0 }}
      placeholder="Search for your gym..."
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType="search" // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      listViewDisplayed="auto" // true/false/undefined
      fetchDetails
      renderDescription={row => row.description} // custom description render
      onPress={async (data, details) => { // 'details' is provided when fetchDetails = true
        parent.setState({ spinner: true });
        const { lat, lng } = details.geometry.location
        if (details && details.types && details.types.includes('gym')) {
          const gym = await fetchPhotoPath(details);
          const marker = (
            <Marker
              key={gym.place_id}
              coordinate={{
                latitude: lat,
                longitude: lng,
              }}
              pinColor={colors.secondary}
              onPress={event => {
                event.stopPropagation();
                parent.setState(
                  {
                    selectedLocation: gym,
                    latitude: lat,
                    longitude: lng,
                  },
                  () => onOpen(gym.place_id)
                );
              }}
            />
          );
          parent.setState(
            {
              selectedLocation: gym,
              latitude: lat,
              longitude: lng,
              markers: [...parent.state.markers, marker],
              spinner: false,
            },
            () => onOpen(gym.place_id)
          );
        } else {
          Alert.alert('Location selected not recognised as a gym, please contact support if you think this is incorrect')
          parent.setState({latitude: location.lat, longitude: location.lng})
        }
      }}
      getDefaultValue={() => ''}
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: googleApiKey,
        language: 'en', // language of the results
        types: 'establishment', // default: 'geocode'
      }}
      styles={styles}
      //currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
      //currentLocationLabel="Current location"
      nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={{
        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
      }}
      GooglePlacesSearchQuery={{
        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
        rankby: 'distance',
        types: 'gym',
      }}
      //filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
      //predefinedPlaces={[homePlace, workPlace]}
      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
      //renderLeftButton={()  => <Image source={require('path/custom/left-icon')} />}
      //renderRightButton={() => <Icon name="ios-arrow-dropright-circle" style={{color: colors.secondary, fontSize: 30, alignSelf: 'center', marginRight: 10}}/>}
    />
  );
};

const mapStateToProps = ({ sharedInfo }) => ({
  googleApiKey: sharedInfo.envVars.GOOGLE_API_KEY,
});

export default connect(mapStateToProps)(GooglePlacesInput);
