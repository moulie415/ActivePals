import colors from '../../constants/colors'
import Text from '../Text'
import React, { FunctionComponent } from 'react'
import styles from './styles'
import { TouchableOpacity } from 'react-native'
import ButtonProps from '../../types/components/Button'

const AppButton: FunctionComponent<ButtonProps> = ({color, textColor, text, style, textStyle, onPress, ...rest}) => {
  return <TouchableOpacity
          onPress={onPress}
          style={[styles.button, style, {backgroundColor: color || colors.secondary}]}
          {...rest}
          >
            <Text style={[styles.text, {color: textColor || '#fff'}, textStyle]}>{text}</Text>
        </TouchableOpacity>
}

export default AppButton