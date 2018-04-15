import {
	SET_FRIENDS,
	UPDATE_FRIENDS,
	ADD_FRIEND
} from 'Anyone/actions/friends'

const initialState = {
	friends: [],
	refreshing: false,
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_FRIENDS:
			return {
				...state,
				friends: action.friends
			}
		case UPDATE_FRIENDS:
			return {
				...state,
				friends: state.friends.filter(friend => action.friends.includes(friend.uid))
			}
		case ADD_FRIEND:
			return {
				...state,
				friends: [...state.friends.filter(friend => friend.uid != action.friend.uid), action.friend]
			}
		default:
			return state
	}
}