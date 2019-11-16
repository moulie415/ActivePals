import React from 'react'
import {
  TouchableOpacity,
  Alert
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import PropTypes from 'prop-types'

const PrivateIcon = ({size, color, style}) => {
  return <TouchableOpacity onPress={() => {
      Alert.alert('Private session', 'Only invited users can view this session')
    }}>
    <Icon name='ios-lock' size={size || 30} style={{color: color || '#999', paddingHorizontal: 5, ...style}}/>
  </TouchableOpacity>
}

PrivateIcon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.any
}

export default PrivateIcon