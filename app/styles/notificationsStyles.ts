import { StyleSheet, Platform } from 'react-native';

// const deviceHeight = Dimensions.get('window').height;

export default StyleSheet.create({
  unreadBadge: {
    borderRadius: 50,
    width: 17,
    height: 17,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    right: -5,
    marginTop: Platform.OS === 'android' ? -3 : 0,
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
})
