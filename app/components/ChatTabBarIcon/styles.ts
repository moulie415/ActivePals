import {
  StyleSheet,
  Platform
} from 'react-native'
import colors from '../../constants/colors'

const styles = StyleSheet.create({
  active: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.appRed,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 19,
  },
  unreadCount: { 
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default styles