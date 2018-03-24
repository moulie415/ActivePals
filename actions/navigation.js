import { NavigationActions } from 'react-navigation'

const nav = (routeName, params) => NavigationActions.navigate({ routeName, params })

export const navigateLogin = () => {
	return (dispatch, getState) => {
		const resetAction = NavigationActions.reset({
			index: 0,
			actions: [
			NavigationActions.navigate({
				routeName: "Login",
			})
			]
		})
		dispatch(resetAction)
	}
}