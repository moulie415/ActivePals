import * as firebase from 'firebase'
import { removeSessionChat } from 'Anyone/actions/chats'
export const SET_SESSIONS = 'SET_SESSIONS'
export const UPDATE_SESSIONS = 'UPDATE_SESSIONS'

const setSessions = (sessions) => ({
	type: SET_SESSIONS,
	sessions,
})

const updateSessions = (sessions) => ({
	type: UPDATE_SESSIONS,
	sessions,
})

export const fetchSessions = (amount) => {
	return (dispatch) => {
		return firebase.database().ref('sessions').orderByKey().limitToLast(amount).on('value', snapshot => {
			let sessions = []
			let index = 1
			snapshot.forEach(child => {
				let duration = child.val().duration * 60 * 60 * 1000
				let time = new Date(child.val().dateTime.replace(/-/g, '/')).getTime()
				let current = new Date().getTime()
				if (time + duration > current) {
					let inProgress = time < current
						sessions.push({...child.val(), key: child.key, inProgress})
						index++
				}
				else {
					//validate time serverside before deleting session in case clients time is wrong
					firebase.database().ref('timestamp').set(firebase.database.ServerValue.TIMESTAMP)
					.then(()=> {
						firebase.database().ref('timestamp').once('value', snapshot => {
							if (snapshot.val() > time + duration) {
								dispatch(removeSessionChat(child.val(), child.key))
							}
						})
					})
				}
			})
			let promises = []
			sessions.forEach(session => {
				promises.push(new Promise(resolve => {
					firebase.database().ref('users/' + session.host).once('value', snapshot => {
						resolve({...session, host: snapshot.val()})
					})
				}))
			})
			return Promise.all(promises).then(sessions => {
				let obj = sessions.reduce(function(acc, cur, i) {
					acc[cur.key] = cur
					return acc
				}, {})
				dispatch(setSessions(obj))
			})
		})
	}
}

export const fetchPrivateSessions = () =>  {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		return firebase.database().ref('users/' + uid).child('sessions').on('value', snapshot => {
			let privateSessions = []
			let uids = []
			snapshot.forEach(child => {
				if (child.val() == 'private') {
					uids.push(child.key)
				}
			})
			let promises = []
			uids.forEach(uid => {
				promises.push(firebase.database().ref('privateSessions').child(uid).once('value'))
			})

			return Promise.all(promises).then(sessions => {
				sessions.forEach(session => {
					let duration = session.val().duration * 60 * 60 * 1000
					let time = new Date(session.val().dateTime.replace(/-/g, "/")).getTime()
					let current = new Date().getTime()
					if (time + duration > current) {
						let inProgress = time < current
						let host
						if (session.val().host == uid) {
							host = getState().profile.profile
						}
						else {
							let friends = getState().friends.friends
							host = friends[session.val().host]
						}
						privateSessions.push({...session.val(), key: session.key, inProgress, host})
						//this.props.onJoin(session.key, true)
					}
					else {
						//validate time serverside before deleting session in case clients time is wrong
						firebase.database().ref('timestamp').set(firebase.database.ServerValue.TIMESTAMP)
						.then(()=> {
							firebase.database().ref('timestamp').once('value', snapshot => {
								if (snapshot.val() > time + duration) {
									dispatch(removeSessionChat(session.val(), session.key))
								}
							})
						})
					}
				})
				let obj = privateSessions.reduce(function(acc, cur, i) {
					acc[cur.key] = cur
					return acc
				}, {})
				dispatch(setSessions(obj))
			})
		})
	}
}

export const removeSession = (key) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let sessions = getState().sessions.sessions
		let session = sessions[key]
		let type = session.private ? 'privateSessions' : 'sessions'
		if (session.host.uid == uid) {
			firebase.database().ref(type + '/' + key).remove()
			Object.keys(session.users).forEach(user => firebase.database().ref('users/' + user + '/sessions').child(key).remove())
			firebase.database().ref('sessionChats').child(key).remove()
		}
		else {
			firebase.database().ref('users/' + uid + '/sessions').child(key).remove()
			firebase.database().ref(type + '/' + key + '/users').child(uid).remove()
		}
		let sessionsArr = Object.values(sessions).filter(session => session.key != key)
			let obj = sessionsArr.reduce(function(acc, cur, i) {
				acc[cur.key] = cur
				return acc
			}, {})
			dispatch(updateSessions(obj))
		dispatch(removeSessionChat(key))
	}
}
