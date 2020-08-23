import { StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default StyleSheet.create({
  gender: {
    backgroundColor: colors.secondary,
    flex: 1,
    margin: 10,
    borderRadius: 5,
  },
  typeText: {
    alignSelf: 'center',
    fontSize: 15,
    flex: 1,
    textAlign: 'center',
  },
  dateTime: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    color: colors.secondary
  },
  dateTimeButton: {
    
  }
});
