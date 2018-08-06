import firebase from 'react-native-firebase'
export const SET_PROFILE = 'SET_PROFILE'
export const SET_LOGGED_IN = 'SET_LOGGED_IN'
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT'
export const SET_GYM = 'SET_GYM'
export const REMOVE_GYM = 'REMOVE_GYM'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats } from './chats'
import { fetchPosts } from './home'
import { fetchSessions, fetchPrivateSessions } from './sessions'
import { navigateLogin, navigateHome } from './navigation'


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

export const setGym = (id) => ({
	type: SET_GYM,
	id,
})

export const resetGym = () => ({
	type: REMOVE_GYM,
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
	return (dispatch, getState) => {
		let uid = profile.uid
		let friends = profile.friends
		if (getState().nav.index == 0) {
			dispatch(navigateHome())
		}
		dispatch(setHasLoggedIn(true))
		return Promise.all([
			dispatch(fetchFriends(friends)),
			profile.sessions && dispatch(fetchSessionChats(profile.sessions, uid)),
			profile.chats && dispatch(fetchChats(profile.chats)),
			dispatch(fetchPosts(uid, 30)),
			dispatch(fetchSessions()),
			])
	}
}

export const removeUser = () => {
	return (dispatch, getState) => {
		//let cloud function do all the heavy lifting of deleting user data
		let user = firebase.auth().currentUser
		dispatch(setLoggedOut())
		return user.delete().then(() => {
			dispatch(navigateLogin())
		})
	}
}

export const removeGym = () => {
	return (dispatch, getState) => {
		let currentGym = getState().profile.profile.gym
		let uid = getState().profile.profile.uid
		firebase.database().ref('users/' + uid).child('gym').set(null)
		firebase.database().ref('gyms').child(currentGym).once('value', gym => {
			let count = gym.val().userCount - 1
			firebase.database().ref('gyms/' + currentGym).child('userCount').set(count)
			firebase.database().ref('gyms/' + currentGym + '/users').child(uid).remove()
		})
		dispatch(resetGym())
	}
}




