import React, {FunctionComponent, useRef} from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {connect} from 'react-redux';
import Modal from 'react-native-modalbox';
import styles, {locationSearch} from './styles';
import LocationSearchModalProps from '../../types/components/LocationSearchModal';
import {Button} from '@ui-kitten/components';
import {GOOGLE_API_KEY} from '../../constants/strings';

const LocationSearch: FunctionComponent<LocationSearchModalProps> = ({
  isOpen,
  onPress,
  onClosed,
}) => {
  const ref = useRef<GooglePlacesAutocomplete>(null);
  return (
    <Modal
      useNativeDriver
      onClosed={onClosed}
      isOpen={isOpen}
      style={styles.modal}
      position="center"
      key={isOpen ? 1 : 2}>
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
        query={{key: GOOGLE_API_KEY, language: 'en', types: 'establishment'}}
        debounce={200}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{rankby: 'distance', types: 'gym'}}
      />
      <Button
        onPress={onClosed}
        status="danger"
        style={{alignSelf: 'center', marginBottom: 10}}>
        Cancel
      </Button>
    </Modal>
  );
};

export default connect()(LocationSearch);
