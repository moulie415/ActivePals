import React, { Component } from 'react'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import styles from './styles'
import PropTypes from 'prop-types'
import Text from '../Text'
import Button from '../Button'
import Geocoder from 'react-native-geocoder'
import { Alert, View } from 'react-native'
import colors from '../../constants/colors'

class MapModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      text: 'Select location on map',
      latitude: this.props.location.lat,
      longitude: this.props.location.lon
    }
  }

  render() {
    return <Modal
    position={"center"}
    style={styles.modal}
    onClosed={this.props.onClosed} 
    isOpen={this.props.isOpen}
    swipeToClose={false}
    >
    <Text numberOfLines={1} style={{padding: 10, alignSelf: 'center', fontSize: 20}}>{this.state.text}</Text>
    <MapView
          style={{flex: 1}}
          onPress={async (event)=> {
            event.stopPropagation()
            const lat = event.nativeEvent.coordinate.latitude
        	  const lng = event.nativeEvent.coordinate.longitude
            const location = {lat, lng}
            await Geocoder.geocodePosition(location).then(res => {
					    this.setState({text: res[0].formattedAddress, location, latitude: lat, longitude: lng})
			    	})
				    .catch(err => Alert.alert('Error', "Invalid location"))
             //this.props.handlePress(event)
            }}
          showsUserLocation={true}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}

        >
        {Object.values(this.props.places).map(place => {
          const lat = place.geometry.location.lat
          const lng = place.geometry.location.lng
          return <MapView.Marker
                key={place.place_id}
                coordinate={{
                  latitude: lat,
                  longitude: lng
                }}
                pinColor={colors.secondary}
                onPress={(event) => {
                  event.stopPropagation()
                  this.setState({text: place.name, location: {lat, lng, gym: place}, latitude: lat, longitude: lng})
                }}
            />
        })}
        </MapView>
      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
        <Button 
        style={{alignSelf: 'center', marginVertical: 10}}
        color='red'
        text='Cancel'
        onPress={this.props.onClosed}/>
        {this.state.location && <Button
        style={{alignSelf: 'center', marginVertical: 10}}
        text='Confirm'
        onPress={() => {
          this.props.handlePress(this.state.location)
        }}
        />}
      </View>

    </Modal>
  }
}

MapModal.propTypes = {
  onClosed: PropTypes.func,
  isOpen: PropTypes.bool,
  location: PropTypes.any,
  handlePress: PropTypes.func,
  places: PropTypes.any,
}



import { connect } from 'react-redux'

const mapStateToProps =  ({ profile, sessions }) => ({
  location: profile.location,
  places: sessions.places
})

export default connect(mapStateToProps)(MapModal)