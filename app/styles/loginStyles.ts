import {StyleSheet} from 'react-native';
import colors from '../constants/colors';

export default StyleSheet.create({
  spinnerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    width: 250,
    flexDirection: 'row',
    paddingVertical: 5,
    borderRadius: 6,
  },
  appleButton: {
    marginVertical: 10,
    width: 250,
    height: 45,
  },
  spinnerButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
});
