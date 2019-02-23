import {
	SET_SESSION_CHATS,
	ADD_SESSION_CHAT,
	SET_CHATS,
	ADD_CHAT,
	SET_MESSAGE_SESSION,
	RESET_NOTIFICATION,
	NEW_NOTIF,
	UPDATE_CHAT,
	UPDATE_SESSION_CHAT,
	SET_GYM_CHAT,
	SET_MESSAGE,
	RESET_MESSAGE
} from 'Anyone/js/actions/chats'

import {
	SET_LOGGED_OUT
} from 'Anyone/js/actions/profile'

const initialState = {
	sessionChats: {},
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
				sessionChats: {...state.sessionChats, [action.key]: action.session},
			}
		case SET_CHATS:
			return {
				...state,
				chats: action.chats,
			}
		case ADD_CHAT:
			return {
				...state,
				chats: {...state.chats, [action.uid]: action.chat},
			}
		case UPDATE_CHAT:
			return {
				...state,
				chats: {...state.chats, [action.id]: {...state.chats[action.id], lastMessage: action.lastMessage}}
			}
		case UPDATE_SESSION_CHAT:
			return {
				...state,
				sessionChats: {...state.sessionChats, [action.key]: {...state.sessionChats[action.key], lastMessage: action.lastMessage}}
			}
		case SET_MESSAGE_SESSION:
			return {
				...state,
				messageSessions: {...state.messageSessions, [action.id]: {...state.messageSessions[action.id], ...action.messages}},
			}
		case NEW_NOTIF:
			return {
				...state,
				notif: action.notif,
			}
		case RESET_NOTIFICATION:
             return {
                ...state,
                notif: null,
			}
		case SET_GYM_CHAT:
			return {
				...state,
				gymChat: action.chat
			}
		case SET_MESSAGE:
			return {
				...state,
				message: {url: action.url, text: action.text}
			}
		case RESET_MESSAGE:
			return {
				...state,
				message: null
			}
        case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}