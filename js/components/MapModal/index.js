import React, { Component } from 'react'
import MapView  from 'react-native-maps'
import Modal from 'react-native-modalbox'
import styles from './styles'
import PropTypes from 'prop-types'
import Text from '../Text'
import Button from '../Button'

class MapModal extends Component {


  render() {
    return <Modal
    position={"center"}
    style={styles.modal}
    onClosed={this.props.onClosed} 
    isOpen={this.props.isOpen}
    swipeToClose={false}
    >
    <Text style={{paddingVertical: 10, alignSelf: 'center', fontSize: 20}}>Select location on map</Text>
    <MapView
          style={{flex: 1}}
          onPress={(event)=> {
            this.props.handlePress(event)
          }}
          showsUserLocation={true}
          initialRegion={{
            latitude: this.props.location.lat,
            longitude: this.props.location.lon,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          region={{
            latitude: this.props.location.lat,
            longitude: this.props.location.lon,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}

        />
      <Button 
      style={{alignSelf: 'center', marginVertical: 10}}
      color='red'
      text='Cancel'
      onPress={this.props.onClosed}/>

    </Modal>
  }
}

MapModal.propTypes = {
  onClosed: PropTypes.func,
  isOpen: PropTypes.bool,
  location: PropTypes.any,
  handlePress: PropTypes.func
}



import { connect } from 'react-redux'

const mapStateToProps =  ({ profile }) => ({
  location: profile.location
})

export default connect(mapStateToProps)(MapModal)