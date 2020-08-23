import {
  StyleSheet,
  Platform
} from 'react-native'
import colors from '../../constants/colors'


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.select({android: 10})
  },
  countContainer: {
    marginLeft: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.appRed,
    alignItems: 'center',
    justifyContent: 'center'
  },
  count: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  }
})

export default styles