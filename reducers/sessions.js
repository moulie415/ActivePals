import {
	SET_SESSIONS,
	UPDATE_SESSIONS,
	ADD_SESSION,
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
		case ADD_SESSION: {
			return {
				...state,
				sessions: {...state.sessions, [action.session.key]: action.session}
			}
		}
		default:
			return state
	}
}