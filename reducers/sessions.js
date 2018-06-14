import {
	SET_SESSIONS,
	UPDATE_SESSIONS,
} from 'Anyone/actions/sessions'

const initialState = {
	sessions: {},
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_SESSIONS: {
			return {
				...state,
				sessions: {...state.sessions, ...action.sessions}
			}
		}
		case UPDATE_SESSIONS: {
			return {
				...state,
				sessions: {...action.sessions},
			}
		}
		default:
			return state
	}
}