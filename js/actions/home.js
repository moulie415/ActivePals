import firebase from 'react-native-firebase'
export const ADD_POST = 'ADD_POST'
export const SET_FEED = 'SET_FEED'
export const SET_POST = 'SET_POST'
export const SET_USER = 'SET_USER'
export const UPDATE_USERS = 'UPDATE_USERS'
export const SET_POST_COMMENTS = 'SET_POST_COMMENTS'
export const ADD_COMMENT = 'ADD_COMMENT'
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS'
export const SET_NOTIFICATION_COUNT = 'SET_NOTIFICATION_COUNT'

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

const setPostComments = (post, comments, incrementCount) =>  ({
	type: SET_POST_COMMENTS,
	post,
	comments,
	incrementCount
})


const addComment = (post, comment, count) => ({
	type: ADD_COMMENT,
	post,
	comment,
	count
})

const setNotifications = (notifications) => ({
	type: SET_NOTIFICATIONS,
	notifications
})

export const setNotificationCount = (count) => ({
	type: SET_NOTIFICATION_COUNT,
	count
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

export const fetchPost = (key) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		return firebase.database().ref('posts').child(key).once('value', snapshot => {
			let post = snapshot.val()
			post.key = snapshot.key
			return firebase.database().ref('userReps/' + uid).child(key).once('value', snapshot => {
				if (snapshot.val()) {
					post.rep = true
				}
				dispatch(setPost(post))
			})
		})
	}
}


export const fetchPosts = (uid, amount = 30) => {
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
			let date  = new Date().toString()
			firebase.database().ref('reps/' + post).child(uid).set({date, uid, post, type: 'post'}).then(() => {
				if (uid != obj.uid) {
					//add notification for user
					firebase.database().ref('userNotifications/' + obj.uid).child(post + uid).once('value', snapshot => {
						if (!snapshot.val()) {
							firebase.database().ref('notifications').child(post + uid).set({date, uid, postId: post, type: 'postRep'})
								.then(()=> firebase.database().ref('userNotifications/' + obj.uid).child(post + uid).set(true))
								.then(() => upUnreadCount(obj.uid))
						}
					})
					
				}
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
		return firebase.database().ref('comments/' + key).set({uid, postId, text, created_at, parentCommentId, key}).then(() => {
			return firebase.database().ref('posts/' + postId).child('commentCount').once('value', snapshot => {
				let count
				if (snapshot.val()) {
					count = snapshot.val()
					count += 1
				}
				else count = 1
				let user = getState().profile.profile

				//add notification for user
				firebase.database().ref('posts/' + postId).child('uid').once('value', snapshot => {
					if (snapshot.val() && snapshot.val() != user.uid) {
						let date  = new Date().toString()
						firebase.database().ref('notifications').child(key + user.uid).set({date, uid: user.uid, postId, type: 'comment'})
							.then(()=> firebase.database().ref('userNotifications/' + snapshot.val()).child(key + user.uid).set(true))
							.then(() => upUnreadCount(snapshot.val()))
					}
				})

				let obj = {uid, postId, text, created_at, parentCommentId, comment_id: count, user, key}
				let postComments = getState().home.feed[postId].comments || []
				postComments.push(obj)
				postComments = sortComments(postComments)
				postComments.forEach((comment, index) => {
					comment.comment_id = index + 1
				})
				//dispatch(addComment(postId, obj, count))
				dispatch(setPostComments(postId, postComments, true))
				firebase.database().ref('posts/' + postId).child('commentCount').set(count)
				return firebase.database().ref('postComments/' + postId).child(key).set(uid)
			})
		})
	}
}

export const fetchComments = (key, limit = 10) => {
  return (dispatch, getState) => {
	let uid = getState().profile.profile.uid
    firebase.database().ref("postComments").child(key).limitToLast(limit).once("value", snapshot => {
        let promises = []
        if (snapshot.val()) {
          Object.keys(snapshot.val()).forEach(comment => {
            promises.push(
              firebase.database().ref("comments").child(comment).once("value")
            )
          })
        }
        Promise.all(promises).then(comments => {
          let commentsArray = []
		  let commentReps = []
          comments.forEach((comment, index) => {
			obj = comment.val()
            if (comment.val().uid == uid) {
              obj.user = getState().profile.profile
            } else {
              obj.user = getState().friends.friends[obj.uid]
			}
			commentReps.push(firebase.database().ref("reps/" + obj.key).child(uid).once('value'))
			commentsArray.push(obj)
		  })
		  Promise.all(commentReps).then(reps => {
			  reps.forEach((rep, index) => {
				  if (rep.val()) {
					commentsArray[index].rep = true
				  }
			  })
			  commentsArray = sortComments(commentsArray)
			  commentsArray.forEach((comment, index) => {
				comment.comment_id = index + 1
			  })
			dispatch(setPostComments(key, commentsArray))
		  })

        })
      })
  }
}

export const repComment = (comment) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let rep = comment.rep ? false : uid
		let date = new Date().toString()
		if (comment.rep) {
			comment.rep = false
			comment.repCount -= 1
		}
		else {
			comment.rep = true
			if (comment.repCount) {
				comment.repCount += 1
			}
			else comment.repCount = 1
		}
		let postComments = getState().home.feed[comment.postId].comments
		postComments[comment.comment_id -1] = comment
		dispatch(setPostComments(comment.postId, postComments))
		if (rep) {
			firebase.database().ref('reps/' + comment.key).child(uid).set({
				date,
				uid, 
				post: comment.postId,
				type: 'comment'
			}).then(() => {
				firebase.database().ref('comments/' + comment.key).child('repCount').once('value', snapshot => {
					let count
					if (snapshot.val()) {
						count = snapshot.val()
						count += 1
					}
					else count = 1
					firebase.database().ref('comments/' + comment.key).child('repCount').set(count).then(() => {
						firebase.database().ref('userReps/' + uid).child(comment.key).set(rep).then(() => {
							//resolve()
						})
					})
				})
				if (uid != comment.uid) {
					//add notification for user
					firebase.database().ref('userNotifications/' + comment.uid).child(comment.key + uid).once('value', snapshot => {
						if (!snapshot.val()) {
							firebase.database().ref('notifications').child(comment.key + uid).set({date, uid, postId: comment.postId, type: 'commentRep'})
								.then(()=> firebase.database().ref('userNotifications/' + obj.uid).child(comment.key + uid).set(true))
								.then(() => upUnreadCount(obj.uid))
						}
					})
					
				}
			})
		}
		else {
			firebase.database().ref('reps/' + comment.key).child(uid).remove().then(() => {
				firebase.database().ref('comments/' + comment.key).child('repCount').once('value', snapshot => {
					let count
					if (snapshot.val()) {
						count = snapshot.val()
						count -= 1
					}
					else count = 0
					firebase.database().ref('comments/' + comment.key).child('repCount').set(count).then(() => {
						firebase.database().ref('userReps/' + uid).child(comment.key).set(rep).then(() => {
							//resolve()
						})
					})
				})
			})

		}


	}
}

export const fetchRepUsers = (postId, limit = 10) => {
	return (dispatch, getState) => {
		return firebase.database().ref('reps').child(postId).limitToLast(limit).once('value', snapshot => {
			let users = []
			if (snapshot.val()) {
				Object.keys(snapshot.val()).forEach(uid => {
					let user = {}
					let profile
					if (uid == getState().profile.profile.uid) {
						profile = getState().profile.profile
						user.username = 'You'
					}
					else {
						profile = getState().friends.friends[uid]
						user.username = profile.username
					}
					user.image = profile.avatar
					user.user_id = uid
					users.push(user)
				})
			}
			let post = getState().home.feed[postId]
			post.repUsers = users
			dispatch(setPost(post))
		})
	}
}

export const fetchCommentRepsUsers = (comment, limit = 10) => {
	return (dispatch, getState) => {
		const {key, postId, comment_id } = comment
		return new Promise(resolve => {
			firebase.database().ref('reps').child(key).limitToLast(limit).once('value', snapshot => {
				let users = []
				if (snapshot.val()) {
					Object.keys(snapshot.val()).forEach(uid => {
						let user = {}
						let profile
						if (uid == getState().profile.profile.uid) {
							profile = getState().profile.profile
							user.username = 'You'
						}
						else {
							profile = getState().friends.friends[uid]
							user.username = profile.username
						}
						user.image = profile.avatar
						user.user_id = uid
						users.push(user)
					})
				}
				let postComments = getState().home.feed[postId].comments
				postComments[comment_id-1].likes = users
				resolve(users)
				dispatch(setPostComments(postId, postComments))
			})
		})
	}
}

const sortComments = (comments) => {
		comments.sort(function(a,b){
		  return new Date(b.created_at) - new Date(a.created_at)
		})
		return comments
	  
}

export const getNotifications = (limit = 10) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let refs = []
		return firebase.database().ref('userNotifications').child(uid).limitToLast(limit).once('value', snapshot => {
			Object.keys(snapshot.val()).forEach(key => {
				refs.push(firebase.database().ref('notifications').child(key).once('value'))
			})
			return Promise.all(refs).then(notifications => {
				let obj = {}
				notifications.forEach(notification => {
					obj[notification.key] = notification.val()
					obj[notification.key].key = notification.key
				})
				dispatch(setNotifications(obj))
			})
		})
	}
}

export const upUnreadCount = (uid) => {
	return firebase.database().ref('users/' + uid).child('unreadCount').once('value', snapshot => {
		let count = 1
		if (snapshot.val()) {
			count = snapshot.val() + 1
		}
		return firebase.database().ref('users/' + uid).child('unreadCount').set(count)
	})
}

export const setNotificationsRead = () => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		dispatch(setNotificationCount(0))
		return firebase.database().ref('users/' + uid).child('unreadCount').set(0)
		
	} 
}
