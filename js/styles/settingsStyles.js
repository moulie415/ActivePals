import { StyleSheet } from "react-native"
import colors from 'Anyone/js/constants/colors'

export default styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contact: {
		backgroundColor: '#fff',
		padding: 10,
		borderBottomWidth: 0.5,
		borderColor: "#999",
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		minHeight: 50
	},
	spinner: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
	}
})