import {
	SET_SESSION_CHATS,
	ADD_SESSION_CHAT,
	REMOVE_SESSION_CHAT,
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
		case ADD_SESSION_CHAT:
			return {
				...state,
				sessionChats: [...state.sessionChats, action.session]
			}

		default:
			return state
	}
}