import {
  StyleSheet
} from 'react-native'
import colors from '../../constants/colors'

export default StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    elevation:4,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "grey",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  text: {
    color: '#fff'
  }
})