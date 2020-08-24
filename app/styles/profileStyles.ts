import { StyleSheet } from "react-native"
import colors from '../constants/colors'

export default StyleSheet.create({
  input: {
    color: '#fff',
    width: '100%'
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
    margin: 20,
    alignSelf: 'center',
  }
})