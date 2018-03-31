import * as firebase from "firebase"
export const SET_FRIENDS = 'SET_FRIENDS'


const setFriends = (friends) => ({
	type: SET_FRIENDS,
	friends

})

export const fetchFriends = () => {
	return (dispatch) => {
		let user = firebase.auth().currentUser
		firebase.database().ref('users/' + user.uid + '/friends').once('value', snapshot => {
			let friends = []

			Object.keys(snapshot.val()).forEach(friend => {
				let promise = new Promise(function(resolve, reject) {
					let status = snapshot.val()[friend]
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
		})
	}
}


