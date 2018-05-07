import * as firebase from "firebase"
export const ADD_POST = 'ADD_POST'
export const SET_FEED = 'SET_FEED'

const addToFeed = (post, id) => ({
	type: ADD_POST,
	post,
	id
})

const setFeed = (feed) => ({
	type: SET_FEED,
	feed
})

export const addPost = (item) => {
	return (dispatch, getState) => {
		uid = getState().profile.profile.uid
		let uids = Object.keys(getState().friends.friends)
		return firebase.database().ref('posts').push(item).then(snapshot => {
			uids.forEach(friend => {
				firebase.database().ref('userPosts/' + friend).child(snapshot.key).set(true)
			})
			firebase.database().ref('userPosts/' + uid).child(snapshot.key).set(true)
			item.key = snapshot.key
			dispatch(addToFeed(item, snapshot.key))
		})
	}
}

export const fetchPosts = (uid, amount) => {
	return (dispatch, getState) => {
		let promises = []
		return new Promise(resolve => {
			firebase.database().ref('userPosts/' + uid).orderByKey().limitToLast(amount).on('value', snapshot => {
				if (snapshot.val()) {
					Object.keys(snapshot.val()).forEach(post => {
						promises.push(firebase.database().ref('posts/' + post).once('value'))
					})
					Promise.all(promises).then(posts => {
						let feed = {}
						posts.forEach(post => {
							feed[post.key] = post.val()
							feed[post.key].key = post.key
						})
						dispatch(setFeed(feed))
						resolve()
					})
				}
				else resolve()
			})
		})
	}
}