import * as firebase from "firebase"
export const SET_FRIENDS = 'SET_FRIENDS'


const setFriends = (friends) => ({
	type: SET_FRIENDS,
	friends
})


export const fetchFriends = (uids) => {
	return (dispatch) => {
		let friends = []
		Object.keys(uids).forEach(friend => {
			let promise = new Promise(function(resolve, reject) {
				let status = uids[friend]
				firebase.database().ref('users/' + friend).once('value', profile => {
					firebase.storage().ref('images/' + friend ).child('avatar').getDownloadURL() 
					.then(url => {
						resolve({...profile.val(), status, avatar: url})
					})
					.catch(e => {
						resolve({...profile.val(), status})
					})

				})
			})

			friends.push(promise)
		})
		return Promise.all(friends).then(items => {
			dispatch(setFriends(items))
		})
	}
}

export const sendRequest = (uid, friendUid) => {
	return (dispatch) => {
		let promise1 = firebase.database().ref('users/' + uid + '/friends').child(friendUid).set("outgoing")
		let promise2 = firebase.database().ref('users/' + friendUid + '/friends').child(uid).set("incoming")
		return Promise.all([promise1, promise2])
	}
}

export const acceptRequest = (uid, friendUid) => {
	return (dispatch) => {
		let promise1 = firebase.database().ref('users/' + uid + '/friends').child(friendUid).set("connected")
		let promise2 = firebase.database().ref('users/' + friendUid + '/friends').child(uid).set("connected")
		return Promise.all([promise1, promise2])
	}
}

export const deleteFriend = (uid, friendUid) => {
	return (dispatch) => {
		let promise1 = firebase.database().ref('users/' + uid + '/friends').child(friendUid).remove()
		let promise2 = firebase.database().ref('users/' + friendUid + '/friends').child(uid).remove()
		return Promise.all([promise1, promise2])

	}

}


