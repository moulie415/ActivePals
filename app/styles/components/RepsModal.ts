import { StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default StyleSheet.create({
  container: {
    width: 300,
    height: 500,
    borderRadius: 5,
    padding: 5,
  },
  likeImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  likeButton: {
    margin: 10,
    alignItems: 'center',
  },
  likeContainer: {
    padding: 10,
    width: 200,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  likeHeader: {
    textAlign: "center",
    padding: 10,
    marginTop: 10,
    fontWeight: "bold"
  },
  defaultIcon: {
    color: colors.primary,
  },
});
