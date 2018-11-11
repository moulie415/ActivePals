import {
	SET_PROFILE,
	SET_LOGGED_IN,
 	SET_LOGGED_OUT,
 	SET_GYM,
	REMOVE_GYM,
} from 'Anyone/js/actions/profile'
import { Platform, PushNotificationIOS } from 'react-native'

import {
	SET_NOTIFICATION_COUNT
} from '../actions/home'

const initialState = {
	profile: {},
	gym: {},
	loggedIn: false,
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_PROFILE:
			return {
				...state,
				profile: action.profile
			}
		case SET_LOGGED_IN:
			return {
				...state,
				loggedIn: action.loggedIn,
			}
		case SET_GYM:
			return {
				...state,
				gym:  action.gym,
			}
		case REMOVE_GYM:
			return {
				...state,
				gym: null
			}
		case SET_NOTIFICATION_COUNT:
			if (Platform.OS == 'ios') {
				PushNotificationIOS.setApplicationIconBadgeNumber(action.count)
			}
			return {
				...state,
				profile: {...state.profile, unreadCount: action.count }
			}
		case SET_LOGGED_OUT:
			return initialState
		default:
			return state
	}
}