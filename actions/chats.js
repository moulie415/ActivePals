import * as firebase from "firebase"
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
export const SET_SESSION_CHATS = 'SET_SESSION_CHATS'
export const ADD_SESSION_CHAT = 'ADD_SESSION_CHAT'
export const SET_CHATS = 'SET_CHATS'
export const UPDATE_CHATS = 'UPDATE_CHATS'
export const ADD_CHAT = 'ADD_CHAT'
export const SET_MESSAGE_SESSION = 'SET_MESSAGE_SESSION'


const setSessionChats = (sessionChats) => ({
	type: SET_SESSION_CHATS,
	sessionChats
})

const addToSessionChats = (session) => ({
	type: ADD_SESSION_CHAT,
	session,
})

const setChats = (chats) => ({
	type: SET_CHATS,
	chats
})

const addToChats = (chat) => ({
	type: ADD_CHAT,
	chat
})

const setMessageSession = (id, messages) => ({
	type: SET_MESSAGE_SESSION,
	id,
	messages,
})

export const updateChats = (chats) => ({
	type: UPDATE_CHATS,
	chats
})

export const fetchChats = (chats) => {
	return (dispatch) => {
		let chatList = []
		Object.keys(chats).forEach(chat => {
			let val = chats[chat]
			let promise = new Promise(function(resolve, reject) {
				firebase.database().ref('chats').child(val).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					let message = {text: "new chat created"}
					if (lastMessage.val()) {
						message = Object.values(lastMessage.val())[0]
					}
					resolve({uid: chat, chatId: val, lastMessage: message})
				})
			})
			chatList.push(promise)
		})
		return Promise.all(chatList).then(chats => {
			dispatch(setChats(chats))
		})
	}
}

export const addChat = (chat) => {
	return (dispatch) => {
		uid = chat.key
		chatId = chat.val()
		return new Promise(resolve => {
			firebase.database().ref('chats/'+ chatId).orderByKey().limitToLast(1)
			.once('value', lastMessage => {
				let message = {text: "new chat created"}
				if (lastMessage.val()) {
					message = Object.values(lastMessage.val())[0]
				}
				resolve({uid, chatId, lastMessage: message})
				dispatch(addToChats({uid, chatId, lastMessage: message}))
			})
		})
	}
}

export const fetchSessionChats = (sessions, uid) => {
	return (dispatch) => {
		let chatList = []
		Object.keys(sessions).forEach(session => {
			let promise = new Promise(function(resolve, reject) {
				firebase.database().ref('sessions/' + session).once('value', snapshot => {
					if (snapshot.val()) {
						firebase.database().ref('sessionChats/'+ session).orderByKey().limitToLast(1)
						.once('value', lastMessage => {
							let message = {text: "new session chat created"}
							if (lastMessage.val()) {
								message = Object.values(lastMessage.val())[0]
							}
							resolve({...snapshot.val(), id: session, lastMessage: message})
						})
					}
					else {
						reject()
						firebase.database().ref('users/' + uid + '/sessions').child(session).remove()
						FCM.unsubscribeFromTopic(session)
					}
				})
			})
			chatList.push(promise)
		})
		return Promise.all(chatList).then(sessionChats => {
			dispatch(setSessionChats(sessionChats))
		})
	}
}

export const addSessionChat = (session) => {
	return (dispatch) => {
		return new Promise(resolve => {
			firebase.database().ref('sessions/' + session).once('value', snapshot => {
				firebase.database().ref('sessionChats/'+ session).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					let message = {text: "new session chat created"}
					if (lastMessage.val()) {
						message = Object.values(lastMessage.val())[0]
					}
					resolve({...snapshot.val(), id: session, lastMessage: message})
					dispatch(addToSessionChats({...snapshot.val(), id: session, lastMessage: message}))
				})
			})
		})
	}
}

export const removeSessionChat = (session, sessions) => {
	return (dispatch) => {
		let sessionChats = sessions.filter(i => i.id != session)
		dispatch(setSessionChats(sessionChats))
	}
}


export const fetchMessages = (id, amount) => {
	return (dispatch) => {
		return firebase.database().ref('chats/'+ id).orderByKey().limitToLast(amount)
		.once('value', snapshot => {
			let messages = []
			snapshot.forEach(child => {
				messages.push({...child.val(), createdAt: new Date(child.val().createdAt)})
			})
			dispatch(setMessageSession(id, messages))
		})
	}
}

export const fetchSessionMessages = (id, amount) => {
	return (dispatch) => {
		return firebase.database().ref('sessionChats/'+ id).orderByKey().limitToLast(amount)
		.once('value', snapshot => {
			let messages = []
			snapshot.forEach(child => {
				messages.push({...child.val(), createdAt: new Date(child.val().createdAt)})
			})
			dispatch(setMessageSession(id, messages))
		})
	}
}
