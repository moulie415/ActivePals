import {
	SET_FRIENDS,
	ADD_FRIEND
} from 'Anyone/js/actions/friends'

import {
	SET_LOGGED_OUT,
} from 'Anyone/js/actions/profile'
import { UPDATE_FRIEND_STATE } from '../actions/friends';

const initialState = {
	friends: {},
	refreshing: false,
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_FRIENDS:
			return {
				...state,
				friends: action.friends
			}
		case ADD_FRIEND:
			return {
				...state,
				friends: {...state.friends, [action.uid]: action.friend}
			}
		case UPDATE_FRIEND_STATE:
			return {
				...state,
				friends: {...state.friends, [action.uid]: {...state.friends[action.uid], state: action.state}}
			}
		case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}