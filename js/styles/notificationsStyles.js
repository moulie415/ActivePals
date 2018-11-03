
const React = require('react-native')

const { StyleSheet, Platform } = React

// const deviceHeight = Dimensions.get('window').height;

export default styles = StyleSheet.create({
  unreadBadge: {
    borderRadius: 50,
    width: 17,
    height: 17,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    right: -5,
    marginTop: Platform.OS === 'android'? -3 : 0,
    position: 'absolute',

  },
  inboxItem: {
    backgroundColor: '#fff',
    borderBottomColor: '#999',
    borderBottomWidth: 0.5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
})