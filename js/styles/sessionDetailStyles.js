import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default  StyleSheet.create({
  gender: {
  	backgroundColor: colors.secondary,
  	flex: 1,
		margin: 10,
		borderRadius: 5
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
  	backgroundColor: colors.secondary,
		marginBottom: 10,
		borderRadius: 5
  }

})