import {
  TouchableOpacity,
} from 'react-native'
import colors from '../../constants/colors'
import Text from '../Text'
import React from 'react'
import styles from './styles'
import PropTypes from 'prop-types'

const AppButton = ({color, textColor, onPress, text, style}) => {
  return <TouchableOpacity onPress={onPress} style={[styles.button, style, {backgroundColor: color || colors.secondary}]}>
    <Text style={[styles.text, {color: textColor || '#fff'}]}>{text}</Text>
  </TouchableOpacity>
}

AppButton.propsTypes = {
  color: PropTypes.string,
  textColor: PropTypes.string,
  onPress: PropTypes.func,
  text: PropTypes.string,
  style: PropTypes.any
}



export default AppButton