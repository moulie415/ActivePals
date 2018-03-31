import * as firebase from "firebase"
export const SET_PROFILE = 'SET_PROFILE'
import { fetchFriends } from './friends'


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

export const doSetup = () => {
	return (dispatch) => Promise.all([
		dispatch(fetchProfile()),
		dispatch(fetchFriends())
		])
}

