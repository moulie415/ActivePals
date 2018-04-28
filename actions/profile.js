import * as firebase from "firebase"
export const SET_PROFILE = 'SET_PROFILE'
import { fetchFriends } from './friends'
import { fetchSessionChats, fetchChats } from './chats'
import { fetchPosts } from './home'


const setProfile = (profile) => ({
	type: SET_PROFILE,
	profile
})

export const fetchProfile = () => {
	return (dispatch) => {
		let user = firebase.auth().currentUser
		return firebase.database().ref('users/' + user.uid).once('value', snapshot => {
			firebase.storage().ref('images/' + user.uid ).child('avatar').getDownloadURL() 
			.then(url => {
				dispatch(setProfile({...snapshot.val(), avatar: url}))
			})
			.catch(e => {
				dispatch(setProfile(snapshot.val()))
			})

		})
	}
}

export const doSetup = (profile) => {
	return (dispatch) => {
		return Promise.all([
			profile.val().friends && dispatch(fetchFriends(profile.val().friends)),
			profile.val().sessions && dispatch(fetchSessionChats(profile.val().sessions, profile.val().uid)),
			profile.val().chats && dispatch(fetchChats(profile.val().chats)),
			dispatch(fetchPosts(profile.val().uid, 30))
			])
	}
}

