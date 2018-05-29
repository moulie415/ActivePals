import {
	SET_PROFILE,
} from 'Anyone/actions/profile'

const initialState = {
	profile: {},
	loggedIn: false
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_PROFILE:
			return {
				...state,
				profile: action.profile
			}
		// case SET_LOGGED_IN:
		// 	return {
		// 		...state,
		// 		profile: action.loggedIn
		// 	}
		default:
			return state
	}
}