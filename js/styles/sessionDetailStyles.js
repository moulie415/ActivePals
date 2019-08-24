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
	}
})

export const locationSearch = StyleSheet.create({
		textInputContainer: {
			backgroundColor: 'transparent',
			marginHorizontal: 10,
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: '#999',
		},
		description: {
			fontWeight: 'bold'
		},
})