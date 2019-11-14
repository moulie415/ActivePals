import React from 'react'
import {
  TouchableOpacity,
  Alert
} from 'react-native'
import {
  Icon
} from 'native-base'
import PropTypes from 'prop-types'

const PrivateIcon = ({size, color, style}) => {
  return <TouchableOpacity onPress={() => {
      Alert.alert('Private session', 'Only invited users can view this session')
    }}>
    <Icon name='ios-lock' style={{fontSize: size || 30, color: color || '#999', paddingHorizontal: 5, ...style}}/>
  </TouchableOpacity>
}

PrivateIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.any
}

export default PrivateIcon