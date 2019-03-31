import {
  StyleSheet
} from 'react-native'
import colors from '../../constants/colors'

export default styles = StyleSheet.create({
  modal: {
    height: 400,
    width: '90%',
  },
  button: {
    color: '#fff',
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    padding: 5,
    paddingHorizontal: 10
  }
})