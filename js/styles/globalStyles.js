import { StyleSheet } from 'react-native'
import colors from '../constants/colors'

export default StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  headerLeft: {
    position:'absolute',
    top:0,
    bottom:0,
    left:0,
    justifyContent: 'center',
    paddingLeft: 10
  },
  bubbleShadow: {
    shadowColor: '#999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 4,
  }
})
