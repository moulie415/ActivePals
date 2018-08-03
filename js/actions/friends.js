import firebase from 'react-native-firebase'
import { removeChat, addChat } from './chats'
import { fetchPrivateSessions } from './sessions'
export const SET_FRIENDS = 'SET_FRIENDS'
export const UPDATE_FRIENDS = 'UPDATE_FRIENDS'
export const ADD_FRIEND = 'ADD_FRIEND'
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from 'react-native-fcm'



const setFriends = (friends) => ({
	type: SET_FRIENDS,
	friends,
})

const addToFriends = (uid,friend) => ({
	type: ADD_FRIEND,
	uid,
	friend,
})


export const removeFriend = (uid) => {
	return (dispatch, getState) => {
		let friends = getState().friends.friends
		let friendArr = Object.values(friends).filter(friend => friend.uid != uid)
		let obj = friendArr.reduce(function(acc, cur, i) {
				acc[cur.uid] = cur
				return acc
			}, {})
		dispatch(setFriends(obj))
		dispatch(removeChat(uid))
	}
}



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
			let obj = items.reduce(function(acc, cur, i) {
				acc[cur.uid] = cur
				return acc
			}, {})
			dispatch(setFriends(obj))
			dispatch(fetchPrivateSessions())
		})
	}
}

export const addFriend = (uid) => {
	return (dispatch, getState) => {
		let status = uid.val()
		return new Promise(resolve => {
			firebase.database().ref('users/' + uid.key).once('value', profile => {
				firebase.storage().ref('images/' + uid.key).child('avatar').getDownloadURL()
				.then(url => {
					resolve()
					dispatch(addToFriends(uid.key, {...profile.val(), status, avatar: url}))
				})
				.catch(e => {
					resolve()
					dispatch(addToFriends(uid.key, {...profile.val(), status}))
				})
			})
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

export const deleteFriend = (uid, friendUid, profile) => {
	return (dispatch) => {
		//handle most the deletion server side using cloud function
		return firebase.database().ref('users/' + uid + '/friends').child(friendUid).remove()

	}

}
