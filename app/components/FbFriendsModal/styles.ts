import {
  StyleSheet
} from 'react-native'
import colors from '../../constants/colors'

export default StyleSheet.create({
  modal: {
    height: 400,
    width: '90%',
    borderRadius: 10,
  },
  button: {
    color: '#fff',
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5
  },
})