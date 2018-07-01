import {
	SET_SESSIONS,
	SET_PRIVATE_SESSIONS,
	UPDATE_SESSIONS,
	UPDATE_PRIVATE_SESSIONS,
	ADD_SESSION,
} from 'Anyone/actions/sessions'

const initialState = {
	sessions: {},
	privateSessions: {},
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_SESSIONS: {
			return {
				...state,
				sessions: {...state.sessions, ...action.sessions},
			}
		}
		case SET_PRIVATE_SESSIONS: {
			return {
				...state,
				privateSessions: {...state.privateSessions, ...action.sessions},
			}
		}
		case UPDATE_SESSIONS: {
			return {
				...state,
				sessions: {...action.sessions},
			}
		}
		case UPDATE_PRIVATE_SESSIONS: {
			return {
				...state,
				privateSessions: {...action.sessions},
			}
		}
		case ADD_SESSION: {
			return {
				...state,
				sessions: {...state.sessions, [action.session.key]: action.session},
			}
		}
		default:
			return state
	}
}