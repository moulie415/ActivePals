import React from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { fetchPhotoPath } from '../../Sessions'
import MapView  from 'react-native-maps'
import colors from '../../constants/colors'
import str from '../../constants/strings'
import {
  Alert
} from 'react-native'

const GooglePlacesInput = (_this) => {
  return (
    <GooglePlacesAutocomplete
      style={{flex: 0}}
      placeholder="Search for your gym..."
      minLength={2} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      listViewDisplayed='auto'    // true/false/undefined
      fetchDetails={true}
      renderDescription={row => {
      return row.description
      }} // custom description render
      onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
        _this.setState({spinner: true})
        let location = details.geometry.location
        if (details && details.types && details.types.includes("gym")) {
          fetchPhotoPath(details).then(path => {
            let marker = <MapView.Marker
                key={details.place_id}
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
                pinColor={colors.secondary}
                onPress={(event) => {
                  event.stopPropagation()
                  _this.setState({selectedLocation: details, latitude: location.lat, longitude: location.lng},
                    ()=> {
                          _this.setState({locationPhoto: path, loadedGymImage: true}, ()=> _this.refs.locationModal.open())
                    })
                }}
                />

            _this.setState({
              selectedLocation: details,
              locationPhoto: path,
              loadedGymImage: true,
              latitude: location.lat,
              longitude: location.lng,
              spinner: false,
              markers: [..._this.state.markers, marker],
            },
              ()=> _this.refs.locationModal.open())
          })
        }
        else {
          Alert.alert('Location selected not recognised as a gym, please contact support if you think this is incorrect')
          _this.setState({latitude: location.lat, longitude: location.lng})
        }
      }}
      
      getDefaultValue={() => ''}
      
      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: str.googleApiKey,
        language: 'en', // language of the results
        types: 'establishment' // default: 'geocode'
      }}
      
      styles={{
        textInputContainer: {
          width: '100%',
        },
        container: {
          position: 'absolute',
          width: '100%',
          backgroundColor: '#fff'
        },
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}
      
      //currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
      //currentLocationLabel="Current location"
      nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
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
}

export default GooglePlacesInput