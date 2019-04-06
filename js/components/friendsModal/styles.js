import {
  StyleSheet
} from 'react-native'
import colors from '../../constants/colors'

export default StyleSheet.create({
  button: {
    color: '#fff',
    backgroundColor: colors.secondary,
    alignSelf: 'center',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 5
  },
  modal: {
    height: 400,
    width: '90%',
  },
})