import * as firebase from "firebase"
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'
export const SET_SESSION_CHATS = 'SET_SESSION_CHATS'
export const ADD_SESSION_CHAT = 'ADD_SESSION_CHAT'


const setSessionChats = (sessionChats) => ({
	type: SET_SESSION_CHATS,
	sessionChats
})

const addToSessionChats = (session) => ({
	type: ADD_SESSION_CHAT,
	session,
})

export const fetchSessionChats = (sessions, uid) => {
	return (dispatch) => {
		let chatList = []
			Object.keys(sessions).forEach(session => {
				let promise = new Promise(function(resolve, reject) {
					firebase.database().ref('sessions/' + session).once('value', snapshot => {
						if (snapshot.val()) {
							firebase.database().ref('sessionChats/'+ session).orderByKey().limitToLast(1)
							.once('value', lastMessage => {
								let message = {text: "new group created"}
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
			return Promise.all(chatList).then((sessionChats) => {
				dispatch(setSessionChats(sessionChats))
			})
	}
}

export const addSessionChat = (session) => {
	return (dispatch) => {
		let promise = new Promise(function(resolve, reject) {
			firebase.database().ref('sessions/' + session).once('value', snapshot => {
				firebase.database().ref('sessionChats/'+ session).orderByKey().limitToLast(1)
				.once('value', lastMessage => {
					let message = {text: "new group created"}
					if (lastMessage.val()) {
						message = Object.values(lastMessage.val())[0]
					}
					resolve({...snapshot.val(), id: session, lastMessage: message})
				})
			})
		})
		return promise.then((sessionChat) => dispatch(addToSessionChats(sessionChat)))
	}
}

export const removeSessionChat = (session, sessions) => {
	return (dispatch) => {
		let sessionChats = sessions.filter(i => i.id != session)
		dispatch(setSessionChats(sessionChats))
	}
}
