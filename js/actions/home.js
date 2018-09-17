import firebase from 'react-native-firebase'
export const ADD_POST = 'ADD_POST'
export const SET_FEED = 'SET_FEED'
export const SET_POST = 'SET_POST'
export const SET_USER = 'SET_USER'
export const UPDATE_USERS = 'UPDATE_USERS'

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

const setUser = (user) => ({
	type: SET_USER,
	user,
})

const updateUsers = (users) => ({
	type: UPDATE_USERS,
	users,
})

export const addPost = (item) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let uids = Object.keys(getState().friends.friends)
		let ref = firebase.database().ref('posts').push()
		let key = ref.key
		return ref.set(item).then(() => {
			uids.forEach(friend => {
				firebase.database().ref('userPosts/' + friend).child(key).set(uid)
			})
			firebase.database().ref('userPosts/' + uid).child(key).set(uid)
			item.key = key
			dispatch(addToFeed(item, key))
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
						let users = []
						posts.forEach(post => {
							feed[post.key] = post.val()
							feed[post.key].key = post.key
							reps.push(firebase.database().ref('userReps/' + uid).child(post.key).once('value'))
							users.push(firebase.database().ref('users/' + post.val().uid).once('value'))

						})
						Promise.all(reps).then(reps => {
							reps.forEach(rep => {
								if (rep.val()) {
									feed[rep.key].rep = true
								}
							})
							Promise.all(users).then(users => {
								let sharedUsers = {}
								users.forEach(user => {
									if (user.val()) {
										sharedUsers[user.key] = user.val()
									}
								})
								dispatch(updateUsers(sharedUsers))
								dispatch(setFeed(feed))
								resolve()
							})
						})
					})
				}
				else {
					dispatch(setFeed({}))
					resolve()
				}
			})
		})
	}
}

export const resetFeed = () => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		dispatch(setFeed({}))
		dispatch(fetchPosts(uid, 30))
	}
}

export const repPost = (item) => {
	return (dispatch, getState) => {
		let post = item.key
		let uid = getState().profile.profile.uid
		let obj = getState().home.feed[post]
		let rep = obj.rep ? false : obj.uid
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

export const postComment = (uid, postId, text, created_at, parentCommentId) => {
	return (dispatch, getState) => {
		let ref = firebase.database().ref('comments').push()
		let key = ref.key
		return firebase.database().ref('comments/' + key).set({uid, postId, text, created_at, parentCommentId}).then(() => {
			return firebase.database().ref('posts/' + postId).child('commentCount').once('value', snapshot => {
				let count
				if (snapshot.val()) {
					count = snapshot.val()
					count += 1
				}
				else count = 1
				firebase.database().ref('posts/' + postId).child('commentCount').set(count)
				return firebase.database().ref('postComments/' + postId).child(key).set(uid)
			})
		})
	}
}

export const fetchComments = (key, limit = 10) => {
	return (dispatch) => {
		firebase.database().ref('postComments').child(key).limitToLast(limit).once('value', snapshot => {
			let promises = []
			if (snapshot.val()) {
				Object.keys(snapshot.val()).forEach(comment => {
					promises.push(firebase.database().ref('comments').child(comment).once('value'))
				})
			}
			Promise.all(promises).then(comments => {
				comments.forEach(comment => {
					console.log(comment)
				})
			})
		})
	}
}
