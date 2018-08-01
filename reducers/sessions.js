import {
	SET_SESSIONS,
	SET_PRIVATE_SESSIONS,
	UPDATE_SESSIONS,
	UPDATE_PRIVATE_SESSIONS,
	SET_SESSION,
	SET_PRIVATE_SESSION,
} from 'Anyone/actions/sessions'

import {
	SET_LOGGED_OUT,
} from 'Anyone/actions/profile'

const initialState = {
	sessions: {},
	privateSessions: {},
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_SESSIONS: {
			return {
				...state,
				sessions: action.sessions,
			}
		}
		case SET_PRIVATE_SESSIONS: {
			return {
				...state,
				privateSessions: action.sessions,
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
		case SET_SESSION: {
			return {
				...state,
				sessions: {...state.sessions, [action.session.key]: action.session},
			}
		}
		case SET_PRIVATE_SESSION: {
			return {
				...state,
				privateSessions: {...state.privateSessions, [action.session.key]: action.session},
			}
		}
		case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}