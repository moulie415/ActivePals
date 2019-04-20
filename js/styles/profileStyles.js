import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default StyleSheet.create({
  input: {
    color: '#fff',
    fontFamily: 'Avenir'
  },
  inputGrp: {
    flexDirection: 'row',
    //backgroundColor: '#fff7',
    backgroundColor: colors.primaryLighter,
    marginBottom: 20,
    borderWidth: 0,
    borderColor: 'transparent',
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 10,
    height: 40,
    alignItems: 'center',
    borderRadius: 5
  },
  logout: {
    backgroundColor: colors.secondary,
    margin: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  }
})