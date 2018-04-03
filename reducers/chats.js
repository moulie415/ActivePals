import {
	SET_SESSION_CHATS,
} from 'Anyone/actions/chats'

const initialState = {
	sessionChats: [],
}

export default function(state = initialState, action) {
	switch (action.type) {
		case SET_SESSION_CHATS:
			return {
				...state,
				sessionChats: action.sessionChats
			}
		default:
			return state
	}
}