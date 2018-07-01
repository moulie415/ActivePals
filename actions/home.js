import * as firebase from "firebase"
export const ADD_POST = 'ADD_POST'
export const SET_FEED = 'SET_FEED'
export const SET_POST = 'SET_POST'

const addToFeed = (post, id) => ({
	type: ADD_POST,
	post,
	id,
})

const setFeed = (feed) => ({
	type: SET_FEED,
	feed,
})

const setPost = (post) => ({
	type: SET_POST,
	post,
})

export const addPost = (item) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
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
						firebase.database().ref('posts/' + post).on('child_changed', child => {
								if (child.key == 'repCount') {
									let obj = getState().home.feed[post]
									obj.repCount = child.val()
									dispatch(setPost(obj))
								}
						})
					})
					Promise.all(promises).then(posts => {
						let feed = {}
						let reps = []
						posts.forEach(post => {
							feed[post.key] = post.val()
							feed[post.key].key = post.key
							reps.push(firebase.database().ref('userReps/' + uid).child(post.key).once('value'))
						})
						Promise.all(reps).then(reps => {
							reps.forEach(rep => {
								if (rep.val()) {
									feed[rep.key].rep = true
								}
							})
							dispatch(setFeed(feed))
							resolve()
						})
					})
				}
				else resolve()
			})
		})
	}
}

export const repPost = (item) => {
	return (dispatch, getState) => {
		let post = item.key
		let uid = getState().profile.profile.uid
		let obj = getState().home.feed[post]
		let rep = obj.rep ? false : true
		if (obj.rep) {
			obj.rep = false
			obj.repCount -= 1
		}
		else {
			obj.rep = true
			if (obj.repCount) {
				obj.repCount += 1
			}
			else obj.repCount = 1
		}
		dispatch(setPost(obj))
		return new Promise(resolve => {
			if (rep) {
			firebase.database().ref('reps/' + post).child(uid).set({date: new Date().toString(), uid, post, type: 'post'}).then(() => {
				firebase.database().ref('posts/' + post).child('repCount').once('value', snapshot => {
					let count
					if (snapshot.val()) {
						count = snapshot.val()
						count += 1
					}
					else count = 1
					firebase.database().ref('posts/' + post).child('repCount').set(count).then(() => {
						firebase.database().ref('userReps/' + uid).child(post).set(rep).then(() => {
							resolve()
						})
					})
				})
			})
		}
		else {
			firebase.database().ref('reps/' + post).child(uid).remove().then(() => {
				firebase.database().ref('posts/' + post).child('repCount').once('value', snapshot => {
					let count
					if (snapshot.val()) {
						count = snapshot.val()
						count -= 1
					}
					else count = 0
					firebase.database().ref('posts/' + post).child('repCount').set(count).then(() => {
						firebase.database().ref('userReps/' + uid).child(post).set(rep).then(() => {
							resolve()
						})
					})
				})
			})
		}
		})
	}
}
