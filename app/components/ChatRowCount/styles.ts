import {
  StyleSheet,
} from 'react-native'
import colors from '../../constants/colors'


const styles = StyleSheet.create({
  countContainer: {
    marginLeft: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.appRed,
    alignItems: 'center',
    justifyContent: 'center'
  },
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
})

export default styles