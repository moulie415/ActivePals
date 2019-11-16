 import firebase from 'react-native-firebase'
export const SET_PROFILE = 'SET_PROFILE'
export const SET_LOGGED_IN = 'SET_LOGGED_IN'
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT'
export const SET_GYM = 'SET_GYM'
export const REMOVE_GYM = 'REMOVE_GYM'
export const SET_LOCATION = 'SET_LOCATION'
export const SET_HAS_VIEWED_WELCOME = 'SET_HAS_VIEWED_WELCOME'
export const SET_ENV_VARS = 'SET_ENV_VARS'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats, fetchGymChat, setGymChat, getUnreadCount } from './chats'
import { fetchPosts } from './home'
import { fetchSessions, fetchPhotoPath } from './sessions'
import { navigateLogin, navigateHome, navigateWelcome } from './navigation'


const setProfile = (profile) => ({
	type: SET_PROFILE,
	profile,
})

const setEnvVars = (vars) => ({
	type: SET_ENV_VARS,
	vars
})

export const setHasLoggedIn = (loggedIn) => ({
	type: SET_LOGGED_IN,
	loggedIn,
})

export const setLoggedOut = () => ({
	type: SET_LOGGED_OUT,
})

export const setGym = (gym) => ({
	type: SET_GYM,
	gym,
})

export const resetGym = () => ({
	type: REMOVE_GYM,
})

export const setLocation = (location) => ({
	type: SET_LOCATION,
	location
})

export const setHasViewedWelcome = () => ({
	type: SET_HAS_VIEWED_WELCOME
})


export const fetchProfile = () => {
	return async (dispatch) => {
		const user = firebase.auth().currentUser
		const envVars = await firebase.database().ref('ENV_VARS').once('value')
		const { GOOGLE_API_KEY } = envVars.val()
		process.env.GOOGLE_API_KEY = GOOGLE_API_KEY
		dispatch(setEnvVars(envVars.val()))
		return new Promise(resolve => {
			firebase.database().ref('users/' + user.uid).once('value', snapshot => {
				firebase.storage().ref('images/' + user.uid ).child('avatar').getDownloadURL()
				.then(url => {
					dispatch(setProfile({...snapshot.val(), avatar: url}))
					fetchGym(snapshot.val(), dispatch)
					resolve({...snapshot.val(), avatar: url})
				})
				.catch(e => {
					dispatch(setProfile(snapshot.val()))
					fetchGym(snapshot.val(), dispatch)
					resolve(snapshot.val())
				})
			})
		})
	}
}

const fetchGym = (profile, dispatch) => {
	if (profile.gym) {
		firebase.database().ref('gyms/' + profile.gym).once('value', gym => {
			fetchPhotoPath(gym.val()).then(gym => {
				dispatch(setGym(gym))
			})
		})
	}
}

export const doSetup = (profile) => {
	return async (dispatch, getState) => {
		const uid = profile.uid
		setupPresence(uid)
		try {
			const fcmToken = await firebase.messaging().getToken()
			if (fcmToken) {
				firebase.database().ref('users/' + uid).child('FCMToken').set(fcmToken)
				console.log('fcm token: ' + fcmToken)
			} 
			else {
				console.warn('no token')
			}
		} catch(e) {
			console.warn(e)
		}
		const friends = profile.friends
		if (getState().nav.index == 0) {
			if (getState().profile.hasViewedWelcome) {
				dispatch(navigateHome())
			}
			else {
				dispatch(navigateWelcome())
			}
		}
		dispatch(setHasLoggedIn(true))
		dispatch(getUnreadCount(uid))
		return dispatch(fetchFriends(friends)).then(() => {
				profile.sessions && dispatch(fetchSessionChats(profile.sessions, uid))
				profile.chats && dispatch(fetchChats(profile.chats))
				profile.gym && dispatch(fetchGymChat(profile.gym))
				dispatch(fetchPosts(uid))
				dispatch(fetchSessions())
		})

	}
}

export const removeUser = () => {
	return (dispatch) => {
		//let cloud function do all the heavy lifting of deleting user data
		const user = firebase.auth().currentUser
		dispatch(setLoggedOut())
		return user.delete().then(() => {
			dispatch(navigateLogin())
		})
	}
}

export const removeGym = () => {
	return (dispatch, getState) => {
		let currentGym = getState().profile.gym.place_id
		let uid = getState().profile.profile.uid
		firebase.database().ref('users/' + uid).child('gym').set(null)
		firebase.database().ref('gyms').child(currentGym).once('value', gym => {
			let count = gym.val().userCount - 1
			firebase.database().ref('gyms/' + currentGym).child('userCount').set(count)
			firebase.database().ref('gyms/' + currentGym + '/users').child(uid).remove()
		})
		dispatch(resetGym())
		dispatch(setGymChat(null))
	}
}

export const joinGym = (location) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		if (getState().profile.gym) {
			dispatch(removeGym())
		}
		firebase.database().ref('users/' + uid).child('gym').set(location.place_id)
		firebase.database().ref('gyms').child(location.place_id).once('value', gym => {
		if (!gym.val()) {
			location.users = {[uid]: true}
			location.userCount = 1
			firebase.database().ref('gyms').child(location.place_id).set(location)
			let systemMessage = {
				_id: 1,
				text: 'Beginning of chat',
				createdAt: new Date().toString(),
				system: true,
			}
			firebase.database().ref('gymChats/' + location.place_id).push(systemMessage).then(() => {
				dispatch(fetchGymChat(location.place_id))
			})

		}
		else {
			let count = gym.val().userCount ? gym.val().userCount + 1 : 1
			firebase.database().ref('gyms/' + gym.val().place_id).child('userCount').set(count)
			firebase.database().ref('gyms/' + gym.val().place_id + '/users').child(uid).set(true)
			dispatch(fetchGymChat(location.place_id))
		}
		dispatch(setGym(location))
		})
	}
  }

  const setupPresence = (uid) => {

	let ref = firebase.database().ref('users/' + uid).child('state')

	let connectedRef = firebase.database().ref('.info/connected')
	connectedRef.on('value', (snap) => {
	if (snap.val() === true) {
		ref.onDisconnect().remove()
		ref.set(true)
	}
	})
  }



