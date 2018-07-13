import {
	ADD_POST,
	SET_FEED,
	SET_POST,
	SET_REP_COUNT,
} from 'Anyone/actions/home'

import {
	SET_LOGGED_OUT,
} from 'Anyone/actions/profile'

const initialState = {
	feed: {},
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_FEED: {
			return {
				...state,
				feed: action.feed
			}
		}
		case ADD_POST:
			return {
				...state,
				feed: {...state.feed, [action.id]: action.post}
			}
		case SET_POST:
			return {
				...state,
				feed: {...state.feed, [action.post.key]: action.post },
			}
		case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}