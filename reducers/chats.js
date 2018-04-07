import {
	SET_SESSION_CHATS,
	ADD_SESSION_CHAT,
	REMOVE_SESSION_CHAT,
	SET_CHATS
} from 'Anyone/actions/chats'

const initialState = {
	sessionChats: [],
	chats: []
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
		case SET_CHATS:
			return {
				...state,
				chats: action.chats
			}
		default:
			return state
	}
}