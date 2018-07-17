import * as firebase from "firebase"
export const SET_PROFILE = 'SET_PROFILE'
export const SET_LOGGED_IN = 'SET_LOGGED_IN'
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats } from './chats'
import { fetchPosts } from './home'
import { fetchSessions, fetchPrivateSessions } from './sessions'
import { navigateLogin } from './navigation'


const setProfile = (profile) => ({
	type: SET_PROFILE,
	profile,
})

export const setHasLoggedIn = (loggedIn) => ({
	type: SET_LOGGED_IN,
	loggedIn,
})

export const setLoggedOut = () => ({
	type: SET_LOGGED_OUT,
})

export const fetchProfile = () => {
	return (dispatch) => {
		let user = firebase.auth().currentUser
		return new Promise(resolve => {
			firebase.database().ref('users/' + user.uid).once('value', snapshot => {
				firebase.storage().ref('images/' + user.uid ).child('avatar').getDownloadURL()
				.then(url => {
					dispatch(setProfile({...snapshot.val(), avatar: url}))
					resolve({...snapshot.val(), avatar: url})
				})
				.catch(e => {
					dispatch(setProfile(snapshot.val()))
					resolve(snapshot.val())
				})
			})
		})
	}
}

export const doSetup = (profile) => {
	return (dispatch) => {
		let uid = profile.uid
		let friends = profile.friends
		return Promise.all([
			friends && dispatch(fetchFriends(friends)),
			profile.sessions && dispatch(fetchSessionChats(profile.sessions, uid)),
			profile.chats && dispatch(fetchChats(profile.chats)),
			dispatch(fetchPosts(uid, 30)),
			dispatch(fetchSessions()),
			])
	}
}

export const removeUser = () => {
	return (dispatch, getState) => {
		return new Promise((resolve, reject) => {
			let profile = getState().profile.profile
			if (profile.username) {
				firebase.database().ref('usernames').child(profile.username).remove()
			}
			if (profile.chats) {
				Object.values(profile.chats).forEach(chat => {
					firebase.database().ref('chats').child(chat).remove()
				})
			}

			if (profile.friends) {
				Object.keys(profile.friends).forEach(friend => {
					firebase.database().ref('users/' + friend + '/friends').child(friend).remove()
				})
			}

			firebase.database().ref('users').child(profile.uid).remove()
			.then(() => {
				let user = firebase.auth().currentUser
				user.delete().then(() => {
					dispatch(setLoggedOut(true))
					resolve()
				})
				.catch(e => reject(e))
			})
		})
	}
}



