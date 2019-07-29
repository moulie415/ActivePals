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
	RESET_MESSAGE,
	SET_UNREAD_COUNT
} from '../actions/chats'

import {
	SET_LOGGED_OUT
} from '../actions/profile'

const initialState = {
	sessionChats: {},
	chats: {},
	messageSessions: {},
	unreadCount: {},
	gymChat: {}
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
				chats: {...state.chats,[action.id]: {...state.chats[action.id],lastMessage: action.lastMessage}},
				messageSessions: {
					...state.messageSessions,
					[action.lastMessage.chatId]: {
						...state.messageSessions[action.lastMessage.chatId],
						[action.lastMessage.key]: action.lastMessage
					}
				}
			}
		case UPDATE_SESSION_CHAT:
			return {
				...state,
				sessionChats: {...state.sessionChats, [action.key]: {...state.sessionChats[action.key], lastMessage: action.lastMessage}},
				messageSessions: {
					...state.messageSessions,
					[action.lastMessage.sessionId]: {
						...state.messageSessions[action.lastMessage.sessionId],
						[action.lastMessage.key]: action.lastMessage
					}
				}
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
				gymChat: action.chat,
				messageSessions: {
					...state.messageSessions,
					[action.chat.key]: {
						...state.messageSessions[action.chat.key],
						[action.chat.lastMessage.key]: action.chat.lastMessage
					}
				}
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
		case SET_UNREAD_COUNT:
			return {
				...state,
				unreadCount: {...state.unreadCount, [action.id]: action.count}
			}
        case SET_LOGGED_OUT: {
			return initialState
		}
		default:
			return state
	}
}