import firebase from 'react-native-firebase';
import { removeChat, addChat } from './chats';
import { fetchPrivateSessions } from './sessions';
import { upUnreadCount, fetchUsers } from './home';
import { UserState } from '../types/Profile';
export const SET_FRIENDS = 'SET_FRIENDS';
export const ADD_FRIEND = 'ADD_FRIEND';
export const UPDATE_FRIEND_STATE = 'UPDATE_FRIEND_STATE';

const setFriends = friends => ({
  type: SET_FRIENDS,
  friends,
});

const addToFriends = (uid, friend) => ({
  type: ADD_FRIEND,
  uid,
  friend,
});

export const updateFriendState = (uid, state) => ({
	type: UPDATE_FRIEND_STATE,
	uid,
	state
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



export const fetchFriends = (uids?) => {
	return (dispatch, getState) => {
		let friends = []
		if (!uids) {
			uids = getState().profile.profile.friends
		}
		if (uids) {
		Object.keys(uids).forEach(friend => {
			let promise = new Promise(function(resolve, reject) {
				let status = uids[friend]
				firebase.database().ref('users/' + friend).once('value', profile => {
					let state = profile.val().state
					if (state && state != UserState.AWAY) {
						state = UserState.ONLINE
					}
					else if (!state) {
						state = UserState.OFFLINE
					}
					firebase.storage().ref('images/' + friend ).child('avatar').getDownloadURL()
					.then(url => {
						resolve({...profile.val(), status, avatar: url, state})
					})
					.catch(e => {
						resolve({...profile.val(), status, state})
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
	else {
			return new Promise(resolve => {
				dispatch(setFriends({}))
				resolve()
			})
			
		}	
	}
}

export const addFriend = (uid) => {
	return (dispatch, getState) => {
		let status = uid.val()
		return new Promise(resolve => {
			firebase.database().ref('users/' + uid.key).once('value', profile => {
				let state = profile.val().state
				if (state && state != UserState.AWAY) {
					state = UserState.ONLINE
				}
				else if (!state) {
					state = UserState.OFFLINE
				}
				firebase.storage().ref('images/' + uid.key).child('avatar').getDownloadURL()
				.then(url => {
					resolve()
					dispatch(addToFriends(uid.key, {...profile.val(), status, avatar: url, state}))
				})
				.catch(e => {
					resolve()
					dispatch(addToFriends(uid.key, {...profile.val(), status, state}))
				})
			})
		})
	}
}

export const sendRequest = friendUid => {
	return (dispatch, getState) => {
		const uid = getState().profile.profile.uid
		const promise1 = firebase.database().ref('users/' + uid + '/friends').child(friendUid).set("outgoing")
		const promise2 = firebase.database().ref('users/' + friendUid + '/friends').child(uid).set("incoming")
		return Promise.all([promise1, promise2]).then(() => {
				const date = new Date().toString()
				const ref = firebase.database().ref('notifications').push()
				const key = ref.key
				ref.set({date, uid, type: 'friendRequest'})
					.then(()=> firebase.database().ref('userNotifications/' + friendUid).child(key).set(true))
					.then(() => upUnreadCount(friendUid))
			})
	}
}


export const acceptRequest = (uid, friendUid) => {
	return (dispatch) => {
		const promise1 = firebase.database().ref('users/' + uid + '/friends').child(friendUid).set("connected")
		const promise2 = firebase.database().ref('users/' + friendUid + '/friends').child(uid).set("connected")
		return Promise.all([promise1, promise2])
	}
}

export const deleteFriend = (uid) => {
	return (dispatch, getState) => {
		const you = getState().profile.profile.uid
		//handle most the deletion server side using cloud function
		dispatch(removeFriend(uid))
		return firebase.database().ref('users/' + you + '/friends').child(uid).remove()

	}

}

export const getFbFriends = (token) => {
		const noUsernames = []
    return fetch('https://graph.facebook.com/v5.0/me?fields=friends&access_token=' + token)
      .then(response => response.json())
      .then(async json => {
				if (json.friends && json.friends.data) {
					let uids = await Promise.all(json.friends.data.map(friend => {
						return firebase.database().ref('fbusers').child(friend.id).once('value')
							.then(snapshot => {
								if (snapshot.val()) {
									return snapshot.val()
							 	}
							 	else noUsernames.push(friend)
							})
					}))
					uids = uids.filter(uid => uid != undefined)
					return fetchUsers(uids).then(users => [...users, ...noUsernames])
				}
			})
}

