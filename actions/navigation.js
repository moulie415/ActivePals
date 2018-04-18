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
export const navigateMessaging = (chatId, friendUsername, friendUid ) => nav('Messaging', {chatId, friendUsername, friendUid})
export const navigateMessagingSession = (session, sessionId, sessionTitle) => nav("Messaging", {session, sessionId, sessionTitle})
export const navigateSessionType = (buddies = null) => nav("SessionType", {buddies})
export const navigateSessionDetail = (type, buddies = null) => nav("SessionDetail", {type, buddies})
