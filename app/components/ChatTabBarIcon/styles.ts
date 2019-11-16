import {
  StyleSheet,
  Platform
} from 'react-native'

const styles = StyleSheet.create({
  active: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: 'red',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: Platform.select({android: -3, ios: 0}),
    right: -5
  },
  unreadCount: { 
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default styles