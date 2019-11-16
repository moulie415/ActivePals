import {
	SET_SESSIONS,
	SET_PRIVATE_SESSIONS,
	UPDATE_SESSIONS,
	UPDATE_PRIVATE_SESSIONS,
	SET_SESSION,
	SET_PRIVATE_SESSION,
	SET_PLACES,
	SET_PLACE,
	SET_RADIUS,
	SET_IGNORED
} from '../actions/sessions'

import {
	SET_LOGGED_OUT,
} from '../actions/profile'

const initialState = {
	sessions: {},
	privateSessions: {},
	places: {},
	radius: 10,
	ignored: {}
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
		case SET_PLACES: {
			return {
				...state,
				places: {...state.places, ...action.places}
			}
		}
		case SET_PLACE: {
			return {
				...state,
				places: {...state.places, [action.place.place_id]: action.place}
			}
		}
		case SET_RADIUS: {
			return {
				...state,
				radius: action.radius,
			}
		}
		case SET_IGNORED: {
			return {
				...state,
				ignored: {...state.ignored, [action.session]: true}
			}
		}
		case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}