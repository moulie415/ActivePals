import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  active: {
    width: 17,
    height: 17,
    borderRadius: 9,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    right: 19,
  },
  unreadCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff'
  },
});

export default styles;
