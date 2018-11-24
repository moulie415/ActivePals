import firebase from 'react-native-firebase'
export const SET_PROFILE = 'SET_PROFILE'
export const SET_LOGGED_IN = 'SET_LOGGED_IN'
export const SET_LOGGED_OUT = 'SET_LOGGED_OUT'
export const SET_GYM = 'SET_GYM'
export const REMOVE_GYM = 'REMOVE_GYM'
export const SET_LOCATION = 'SET_LOCATION'
export const SET_HAS_VIEWED_WELCOME = 'SET_HAS_VIEWED_WELCOME'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats, fetchGymChat, setGymChat } from './chats'
import { fetchPosts } from './home'
import { fetchSessions, fetchPrivateSessions } from './sessions'
import { navigateLogin, navigateHome, navigateWelcome } from './navigation'


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

const setGym = (gym) => ({
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
	return (dispatch) => {
		let user = firebase.auth().currentUser
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
			dispatch(setGym(gym.val()))
		})
	}
}

export const doSetup = (profile) => {
	return (dispatch, getState) => {
		let uid = profile.uid
		firebase.messaging().getToken()
            .then(fcmToken => {
                if (fcmToken) {
                    firebase.database().ref('users/' + uid).child('FCMToken').set(fcmToken)
                    console.log('fcm token: ' + fcmToken)
                } else {
                    console.log('no token')
                }
            })
		let friends = profile.friends
		if (getState().nav.index == 0) {
			if (getState().profile.hasViewedWelcome) {
				dispatch(navigateHome())
			}
			else {
				dispatch(navigateWelcome())
			}
		}
		dispatch(setHasLoggedIn(true))
		return dispatch(fetchFriends(friends)).then(() => {
			return Promise.all([
				profile.sessions && dispatch(fetchSessionChats(profile.sessions, uid)),
				profile.chats && dispatch(fetchChats(profile.chats)),
				profile.gym && dispatch(fetchGymChat(profile.gym)),
				dispatch(fetchPosts(uid)),
				dispatch(fetchSessions()),
				])
		})

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




