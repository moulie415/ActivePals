import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
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
    minHeight: 50,
    alignItems: 'center'
  },
})