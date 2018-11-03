import firebase from 'react-native-firebase'
import { removeSessionChat, addSessionChat } from 'Anyone/js/actions/chats'
import { geofire }  from 'Anyone/index'
import {fetchUsers, updateUsers } from './home'
export const SET_SESSIONS = 'SET_SESSIONS'
export const UPDATE_SESSIONS = 'UPDATE_SESSIONS'
export const UPDATE_PRIVATE_SESSIONS = 'UPDATE_PRIVATE_SESSIONS'
export const SET_PRIVATE_SESSIONS = 'SET_PRIVATE_SESSIONS'
export const SET_PRIVATE_SESSION = 'SET_PRIVATE_SESSION'
export const SET_SESSION = 'SET_SESSION'

const setSessions = (sessions) => ({
	type: SET_SESSIONS,
	sessions,
})

const setPrivateSessions = (sessions) => ({
	type: SET_PRIVATE_SESSIONS,
	sessions,
})

const updateSessions = (sessions) => ({
	type: UPDATE_SESSIONS,
	sessions,
})

const updatePrivateSessions = (sessions) => ({
	type: UPDATE_PRIVATE_SESSIONS,
	sessions,
})

const setSession = (session) => ({
	type: SET_SESSION,
	session,
})

const setPrivateSession = (session) => ({
	type: SET_PRIVATE_SESSION,
	session,
})

export const fetchSessions = (radius = 10, update = false) => {
	return (dispatch) => {
		return new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					let lat = position.coords.latitude
					let lon = position.coords.longitude
					let geoQuery = geofire.query({
						center: [lat, lon],
						radius: radius,
					})

					if (update) {
						dispatch(updateSessions([]))
						// geoQuery.updateCriteria({
						// 	center: [lat, lon],
						// 	radius: radius,
						// })
					}

					let onReadyRegistration = geoQuery.on("ready",() => {
						console.log("GeoQuery has loaded and fired all other events for initial data")
						resolve()
					})

					let onKeyEnteredRegistration = geoQuery.on("key_entered", (key, location, distance) => {
						console.log(key + " entered query at " + location + " (" + distance + " km from center)")
						firebase.database().ref('sessions/' + key).once('value', snapshot => {
							if (snapshot.val()) {
								let duration = snapshot.val().duration * 60 * 60 * 1000
								let time = new Date(snapshot.val().dateTime.replace(/-/g, '/')).getTime()
								let current = new Date().getTime()
								if (time + duration > current) {
									let inProgress = time < current
									firebase.database().ref('users/' + snapshot.val().host).once('value', host => {
										dispatch(setSession({...snapshot.val(), key, inProgress, distance, host: host.val()}))
									})
								}
								else {
									//validate time serverside before deleting session in case clients time is wrong
									firebase.database().ref('timestamp').set(firebase.database.ServerValue.TIMESTAMP)
									.then(()=> {
										firebase.database().ref('timestamp').once('value', timestamp => {
											if (timestamp.val() > time + duration) {
												dispatch(removeSession(key, snapshot.val().private))
												firebase.database().ref('sessions/' + key).remove()
												firebase.database().ref('sessionChats').child(key).remove()
												dispatch(removeSessionChat(key))
												geofire.remove(key)
											}
										})
									})
								}
							}
						})
					})

					let onKeyExitedRegistration = geoQuery.on("key_exited", (key, location, distance) => {
						console.log(key + " exited query to " + location + " (" + distance + " km from center)")
						dispatch(removeSession(key, false, true))
					})

					let onKeyMovedRegistration = geoQuery.on("key_moved", (key, location, distance) => {
						console.log(key + " moved within query to " + location + " (" + distance + " km from center)")
					})

				},
				(error) => {

				},
			{ enableHighAccuracy: true, timeout: 20000 /*, maximumAge: 1000*/ },
			)
		})
	}
}

export const fetchPrivateSessions = () =>  {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		userFetches = []
		return firebase.database().ref('users/' + uid).child('sessions').on('value', snapshot => {
			let privateSessions = []
			let uids = []
			snapshot.forEach(child => {
				if (child.val() == 'private') {
					uids.push(child.key)
					dispatch(addSessionChat(child.key, true))
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
						else if (getState().friends.friends[session.val().host]){
							host = getState().friends.friends[session.val().host]
							
						}
						else if (getState().sharedInfo.users[session.val().host]) {
							host = getState().sharedInfo.users[session.val().host]
						}
						else {
							host = {uid: session.val().host}
							userFetches.push(session.val().host)
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
									dispatch(removeSession(session.key, true))
									firebase.database().ref('privateSessions' + '/' + session.key).remove()
									firebase.database().ref('sessionChats').child(session.key).remove()
								}
							})
						})
					}
				})
				let obj = privateSessions.reduce(function(acc, cur, i) {
					if (cur) {
						acc[cur.key] = cur
					}
					return acc
				}, {})
				dispatch(setPrivateSessions(obj))
				if (userFetches.length > 0) {
					fetchUsers(userFetches).then(users => {
						let sharedUsers = {}
						users.forEach(user => {
							if (user.uid) {
								sharedUsers[user.uid] = user
							}
						})
						dispatch(updateUsers(sharedUsers))
					})
				}
			})
		})
	}
}

export const removeSession = (key, isPrivate, force = false) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let sessions = isPrivate ? getState().sessions.privateSessions : getState().sessions.sessions
		let session = sessions[key]
		let type = isPrivate ? 'privateSessions' : 'sessions'
		if (session && session.host.uid == uid) {
			firebase.database().ref(type + '/' + key).remove()
			Object.keys(session.users).forEach(user => firebase.database().ref('users/' + user + '/sessions').child(key).remove())
			firebase.database().ref('sessionChats').child(key).remove()
			geofire.remove(key)
		}
		else {
			firebase.database().ref('users/' + uid + '/sessions').child(key).remove()
			firebase.database().ref(type + '/' + key + '/users').child(uid).remove()
		}
		let obj
		if (session && (isPrivate || session.host.uid == uid || force)) {
			let sessionsArr = Object.values(sessions).filter(session => session.key != key)
			obj = sessionsArr.reduce(function(acc, cur, i) {
				if (cur) {
					acc[cur.key] = cur
				}
				return acc
			}, {})
			}
			else {
				obj = sessions
				if (obj[key] && obj[key].users) {
					obj[key].users[uid] = false
				}
			}
			isPrivate ? dispatch(updatePrivateSessions(obj)) : dispatch(updateSessions(obj))
			dispatch(removeSessionChat(key))
		}
	}

export const addUser = (key, isPrivate) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let sessions = isPrivate ? getState().sessions.privateSessions : getState().sessions.sessions
		let session = sessions[key]
		session.users = {...session.users, [uid]: true}
		isPrivate ? dispatch(setPrivateSession(session)) : dispatch(setSession(session))
	}
}
