import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
  typeText: {
    fontFamily: 'Avenir',
    fontSize: 30, 
    marginLeft: 10
  },
  gender: {
  	backgroundColor: colors.primary,
  	flex: 1,
  	margin: 10
  },
  typeText: {
  	alignSelf: 'center',
  	fontSize: 15,
  	flex: 1,
  	textAlign: 'center'
  },
  createButton: {
  	flex: 1,
  	alignSelf: 'center',
  	borderRadius: 0,
  	padding: 10,
  	backgroundColor: colors.primary,
  	marginBottom: 10
  }

})