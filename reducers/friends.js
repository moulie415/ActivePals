import {
	SET_FRIENDS,
} from 'Anyone/actions/friends'

const initialState = {
	friends: [],
	refreshing: false
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_FRIENDS:
			return {
				...state,
				friends: action.friends
			}
		default:
			return state
	}
}