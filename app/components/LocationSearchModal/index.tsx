import React, { FunctionComponent, useRef } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { connect } from 'react-redux';
import Modal from 'react-native-modalbox';
import styles, { locationSearch } from './styles';
import Button from '../Button';
import LocationSearchModalProps from '../../types/components/LocationSearchModal';

const LocationSearch: FunctionComponent<LocationSearchModalProps> = ({ isOpen, onPress, onClosed, googleApiKey }) => {
  const ref = useRef<GooglePlacesAutocomplete>();
  return (
    <Modal onClosed={onClosed} isOpen={isOpen} style={styles.modal} position="center" key={isOpen ? 1 : 2}>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder="Search..."
        minLength={2}
        autoFocus
        fetchDetails
        listViewDisplayed="auto"
        returnKeyType="search"
        onPress={(data, details) => {
          if (ref && ref.current) {
            ref.current.setAddressText('');
            onPress(details);
          }
        }}
        styles={locationSearch}
        query={{ key: googleApiKey, language: 'en', types: 'establishment' }}
        debounce={200}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{ rankby: 'distance', types: 'gym' }}
      />
      <Button text="Cancel" onPress={onClosed} style={{ alignSelf: 'center', marginBottom: 10 }} color="red" />
    </Modal>
  );
};

const mapStateToProps = ({ sharedInfo }) => ({
  googleApiKey: sharedInfo.envVars.GOOGLE_API_KEY,
});

export default connect(mapStateToProps)(LocationSearch);
