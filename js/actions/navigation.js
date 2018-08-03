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
 export const navigateFriends = () => nav('Friends')

export const navigateHome = () => nav('Home')
export const navigateSessions = () => nav('Sessions') 
export const navigateMessaging = (chatId, friendUsername, friendUid ) => nav('Messaging', {chatId, friendUsername, friendUid})
export const navigateMessagingSession = (session) => nav("Messaging", {session})
export const navigateSessionType = (buddies, location) => nav("SessionType", {buddies, location})
export const navigateSessionDetail = (type, buddies, location) => nav("SessionDetail", {type, buddies, location})
export const navigateSettings = () => nav('Settings')
export const navigateProfile = () => nav('Profile')
export const navigateFilePreview = (type, uri) => nav('FilePreview', {type, uri})
export const navigateBack = () => NavigationActions.back()