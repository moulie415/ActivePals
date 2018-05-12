import * as firebase from "firebase"
export const SET_PROFILE = 'SET_PROFILE'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats } from './chats'
import { fetchPosts } from './home'
import { fetchSessions, fetchPrivateSessions } from './sessions'


const setProfile = (profile) => ({
	type: SET_PROFILE,
	profile
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
			dispatch(fetchSessions(30)),
			])
	}
}

