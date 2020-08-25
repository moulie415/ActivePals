import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  spinner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    borderRadius: 50,
    width: 17,
    height: 17,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  mentionList: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 999,
    elevation: 4,
    shadowOffset: {width: 5, height: 5},
    shadowColor: 'grey',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
