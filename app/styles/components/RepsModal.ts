import { StyleSheet } from 'react-native';
import colors from '../../constants/colors';

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
    padding: 5,
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
