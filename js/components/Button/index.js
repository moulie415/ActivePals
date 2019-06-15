import colors from '../../constants/colors'
import Text from '../Text'
import React from 'react'
import styles from './styles'
import PropTypes from 'prop-types'
import TouchableOpacity from '../TouchableOpacityLockable'

const AppButton = ({color, textColor, onPress, text, style, textStyle}) => {
  return <TouchableOpacity onPress={onPress} style={[styles.button, style, {backgroundColor: color || colors.secondary}]}>
    <Text style={[styles.text, {color: textColor || '#fff'}, textStyle]}>{text}</Text>
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