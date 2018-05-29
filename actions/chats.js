import * as firebase from "firebase"
import { fetchProfile } from './profile'
export const SET_SESSION_CHATS = 'SET_SESSION_CHATS'
export const ADD_SESSION_CHAT = 'ADD_SESSION_CHAT'
export const SET_CHATS = 'SET_CHATS'
export const ADD_CHAT = 'ADD_CHAT'
export const SET_MESSAGE_SESSION = 'SET_MESSAGE_SESSION'
export const NEW_NOTIF = 'NEW_NOTIF'
export const RESET_NOTIFICATION = 'RESET_NOTIFICATION'
export const UPDATE_CHAT = 'UPDATE_CHAT'
export const UPDATE_SESSION_CHAT = 'UPDATE_SESSION_CHAT'


const setSessionChats = (sessionChats) => ({
	type: SET_SESSION_CHATS,
	sessionChats,
})

const addToSessionChats = (key, session) => ({
	type: ADD_SESSION_CHAT,
	key,
	session,
})

const setChats = (chats) => ({
	type: SET_CHATS,
	chats,
})

const addToChats = (uid, chat) => ({
	type: ADD_CHAT,
	uid,
	chat,
})

const setMessageSession = (id, messages) => ({
	type: SET_MESSAGE_SESSION,
	id,
	messages,
})

const updateChat = (id, lastMessage) => ({
	type: UPDATE_CHAT,
	id,
	lastMessage,
})

const updateSessionChat = (key, lastMessage) => ({
	type: UPDATE_SESSION_CHAT,
	key,
	lastMessage,
})


export const newNotification = (notif) => ({
	type: NEW_NOTIF,
	notif,
})

export const resetNotification = () => ({
       type: RESET_NOTIFICATION,
})


export const updateLastMessage = (notif) => {
	return (dispatch, getState) => {
		if (notif.type == 'message') {
			return firebase.database().ref('chats').child(notif.chatId).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					if (lastMessage.val()) {
						dispatch(updateChat(notif.uid, Object.values(lastMessage.val())[0]))
					}
				})
		}
		else if (notif.type == 'sessionMessage') {
			return firebase.database().ref('sessionChats').child(notif.sessionId).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					if (lastMessage.val()) {
						dispatch(updateSessionChat(notif.sessionId, Object.values(lastMessage.val())[0]))
					}
				})

		}
	}
}



export const fetchChats = (chats) => {
	return (dispatch) => {
		let chatList = []
		Object.keys(chats).forEach(chat => {
			let val = chats[chat]
			let promise = new Promise(function(resolve, reject) {
				firebase.database().ref('chats').child(val).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					let message = {text: 'new chat created'}
					if (lastMessage.val()) {
						message = Object.values(lastMessage.val())[0]
					}
					resolve({uid: chat, chatId: val, lastMessage: message})
				})
			})
			chatList.push(promise)
		})
		return Promise.all(chatList).then(chats => {
			let obj = chats.reduce(function(acc, cur, i) {
				acc[cur.uid] = cur
				return acc
			}, {})
			dispatch(setChats(obj))
		})
	}
}

export const addChat = (chat) => {
	return (dispatch) => {
		let uid = chat.key
		let chatId = chat.val()
		return firebase.database().ref('chats').child(chatId).orderByKey().limitToLast(1)
		.once('value', lastMessage => {
			let message = {text: 'new chat created'}
			if (lastMessage.val()) {
				message = Object.values(lastMessage.val())[0]
			}
			dispatch(addToChats(uid, {uid, chatId, lastMessage: message}))
			dispatch(fetchProfile())
		})
	}
}

export const removeChat = (uid) => {
	return (dispatch, getState) => {
		let chats = getState().chats.chats
		let chatArr = Object.values(chats).filter(chat => chat.uid != uid)
		let obj = chatArr.reduce(function(acc, cur, i) {
			acc[cur.uid] = cur
			return acc
		}, {})
		dispatch(setChats(obj))
	}
}

export const fetchSessionChats = (sessions, uid) => {
	return (dispatch) => {
		let chatList = []
		Object.keys(sessions).forEach(session => {
			let type = sessions[session] == 'private' ? 'privateSessions' : 'sessions'
			let promise = new Promise(function(resolve, reject) {
				firebase.database().ref(type + '/' + session).once('value', snapshot => {
					if (snapshot.val()) {
						firebase.database().ref('sessionChats/' + session).orderByKey().limitToLast(1)
						.once('value', lastMessage => {
							let message = {text: "new session chat created"}
							if (lastMessage.val()) {
								message = Object.values(lastMessage.val())[0]
							}
							resolve({...snapshot.val(), key: session, lastMessage: message})
						})
					}
					else {
						resolve()
						dispatch(removeSessionChat(session))
						firebase.database().ref('users/' + uid + '/sessions').child(session).remove()
					}
				})
			})
			chatList.push(promise)
		})
		return Promise.all(chatList).then(sessionChats => {
			let obj = sessionChats.reduce(function(acc, cur, i) {
				acc[cur.key] = cur
				return acc
			}, {})
			dispatch(setSessionChats(obj))
		})
	}
}

export const addSessionChat = (session, isPrivate = false) => {
	return (dispatch) => {
		let type = isPrivate ? 'privateSessions' : 'sessions'
		return new Promise(resolve => {
			firebase.database().ref(type + '/' + session).once('value', snapshot => {
				firebase.database().ref('sessionChats/' + session).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					let message = {text: 'new session chat created'}
					if (lastMessage.val()) {
						message = Object.values(lastMessage.val())[0]
					}
					resolve({...snapshot.val(), key: session, lastMessage: message})
					dispatch(addToSessionChats(session, {...snapshot.val(), key: session, lastMessage: message}))
					dispatch(fetchProfile())
				})
			})
		})
	}
}

export const removeSessionChat = (key) => {
	return (dispatch, getState) => {
		let sessionChats = getState().chats.sessionChats
		let chatArr = Object.values(sessionChats).filter(chat => chat.key != key)
		let obj = chatArr.reduce(function(acc, cur, i) {
			acc[cur.key] = cur
			return acc
		}, {})
		dispatch(setSessionChats(obj))
	}
}

export const fetchMessages = (id, amount, uid) => {
	return (dispatch) => {
		return firebase.database().ref('chats/' + id).orderByKey().limitToLast(amount)
		.once('value', snapshot => {
			let messages = []
			firebase.storage().ref('images/' + uid).child('avatar').getDownloadURL()
			.then (url => {
				snapshot.forEach(child => {
					if (child.val().user && child.val().user._id == uid) {
						messages.push({...child.val(), createdAt: new Date(child.val().createdAt),
							user: {...child.val().user, avatar: url}})
					}
					else {
						messages.push({...child.val(), createdAt: new Date(child.val().createdAt)})
					}
				})
				dispatch(setMessageSession(id, messages))
			})
			.catch(e => {
				snapshot.forEach(child => {
					messages.push({...child.val(), createdAt: new Date(child.val().createdAt)})
				})
				dispatch(setMessageSession(id, messages))
			})
		})
	}
}

export const fetchSessionMessages = (id, amount, isPrivate = false) => {
	return (dispatch) => {
		let type = isPrivate ? 'privateSessions' : 'sessions'
		return firebase.database().ref('sessionChats/' + id).orderByKey().limitToLast(amount)
		.once('value', snapshot => {
			let messages = []
			let promises = []
			firebase.database().ref(type + '/' + id).child('users').once('value', users => {
				users.forEach(child => {
					promises.push(new Promise(resolve => {
						firebase.storage().ref('images/' + child.key ).child('avatar').getDownloadURL()
						.then(url => resolve({[child.key]: url}))
						.catch(e => resolve({[child.key]: null}))
					}))
				})
				Promise.all(promises).then(array => {
					let avatars = {}
					array.forEach((avatar, index) => {
						let key = Object.keys(avatar)[0]
						if (key) {
							avatars[key] = avatar[key]
						}
					})
					snapshot.forEach(child => {
						let avatar = child.val().user ? avatars[child.val().user._id] : ""
						if (avatar) {
							messages.push({...child.val(), createdAt: new Date(child.val().createdAt),
								user: {...child.val().user, avatar}})
						}
						else {
							messages.push({...child.val(), createdAt: new Date(child.val().createdAt)})
							}
					})
					dispatch(setMessageSession(id, messages))
				})
			})
		})
	}
}

