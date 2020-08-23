
import { StyleSheet, Dimensions, Platform } from 'react-native'

export default StyleSheet.create({
  header: {
    width: Dimensions.get('window').width,
    paddingLeft: 15,
    paddingRight: 15,
  },
  rowHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingTop: Platform.OS === 'android' ? 5 : 0,
  },
  btnHeader: {
    paddingTop: 10,
  },
  imageHeader: {
    height: 25,
    width: 95,
    resizeMode: 'contain',
    marginTop: 10,
  },
});
