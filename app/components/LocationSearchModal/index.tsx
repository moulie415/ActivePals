import React from 'react'
import styles, { locationSearch } from './styles'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Modal from 'react-native-modalbox'
import str from '../../constants/strings'
import PropTypes from 'prop-types'
import Button from '../Button'

const LocationSearch = ({isOpen, onPress, onClosed}) => {
  return <Modal
  onClosed={onClosed}
  isOpen={isOpen} 
  style={styles.modal} 
  position={"center"}>
  <GooglePlacesAutocomplete
    ref={(instance) => { this.GooglePlacesRef = instance }}
    placeholder='Search...'
    minLength={2}
    autoFocus={true}
    fetchDetails={true}
    listViewDisplayed='auto'
    returnKeyType={'search'}
    onPress={(data, details) => {
      this.GooglePlacesRef.setAddressText("")
      onPress(details)
    }}
    styles={locationSearch}
    query={{key: str.googleApiKey, language: 'en', types: 'establishment'}}
    debounce={200}
    nearbyPlacesAPI='GooglePlacesSearch'
    GooglePlacesSearchQuery={{rankby: 'distance',types: 'gym'}}
    />
    <Button text='Cancel' onPress={onClosed} style={{alignSelf: 'center', marginBottom: 10}} color="red"/>
  </Modal>
}

LocationSearch.propTypes = {
  isOpen: PropTypes.bool,
  onPress: PropTypes.func,
  onClosed: PropTypes.func
}


export default LocationSearch