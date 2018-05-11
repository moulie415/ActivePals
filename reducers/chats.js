import {
	SET_SESSION_CHATS,
	ADD_SESSION_CHAT,
	REMOVE_SESSION_CHAT,
	SET_CHATS,
	ADD_CHAT,
	SET_MESSAGE_SESSION,
	RESET_NOTIFICATION,
	NEW_NOTIF,
} from 'Anyone/actions/chats'

const initialState = {
	sessionChats: [],
	chats: {},
	messageSessions: {},
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
		case REMOVE_SESSION_CHAT:
			return {
				...state,
				sessionChats: state.sessionChats.filter(chat => chat.key != action.session)
			}
		case SET_CHATS:
			return {
				...state,
				chats: action.chats
			}
		case ADD_CHAT:
			return {
				...state,
				chats: {...state.chats, [action.uid]: action.chat}
			}
		case SET_MESSAGE_SESSION:
			return {
				...state,
				messageSessions: {...state.messageSessions, [action.id]: action.messages}
			}
		case NEW_NOTIF:
			return {
				...state,
				notif: action.notif
			}
		case RESET_NOTIFICATION:
             return {
                ...state,
                notif: null
            }
		default:
			return state
	}
}