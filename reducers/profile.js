import {
	SET_PROFILE,
} from 'Anyone/actions/profile'

const initialState = {
	profile: {}
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_PROFILE:
			return {
				...state,
				profile: action.profile
			}
		default:
			return state
	}
}