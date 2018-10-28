import { StyleSheet, Dimensions, Platform } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
	spinner: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	unreadBadge: {
		borderRadius: 50,
		width: 17,
		height: 17,
		padding: 2,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		backgroundColor: 'red'
	  },
})