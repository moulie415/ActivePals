import firebase from 'react-native-firebase'
import Sound from 'react-native-sound'
export const ADD_POST = 'ADD_POST'
export const SET_FEED = 'SET_FEED'
export const SET_POST = 'SET_POST'
export const SET_USER = 'SET_USER'
export const UPDATE_USERS = 'UPDATE_USERS'
export const SET_POST_COMMENTS = 'SET_POST_COMMENTS'
export const ADD_COMMENT = 'ADD_COMMENT'
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS'
export const SET_NOTIFICATION_COUNT = 'SET_NOTIFICATION_COUNT'
import str from '../constants/strings'

const repSound = new Sound('rep.wav', Sound.MAIN_BUNDLE, (error) => {
	if (error) {
	  console.log('failed to load the sound', error);
	  return;
	}
  })


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

export const updateUsers = (users) => ({
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
			dispatch(sendMentionNotifs(item, key))
			item.key = key
			dispatch(addToFeed(item, key))
		})
		
	}
}

const sendMentionNotifs = (item, key, commentMention = false, postUid) => {
	return (dispatch, getState) => {
		let friends = Object.values(getState().friends.friends)
		let users = Object.values(getState().sharedInfo.users)
		let combined = [...friends, ...users]
		if (item.text) {
			let split = item.text.split(" ")
			let mentions = []
			split.forEach(word => {
				if (!mentions.includes(word)) {
					let mention = word.match(str.mentionRegex)
					if (mention) {
						mentions.push(word)
						let username = mention.input.substring(1)
						let friend = combined.find(friend => friend.username == username)
						if (friend && friend.uid != postUid && friend.uid != item.uid) {
							//add notification for user
							let id = key + item.uid + 'mention'
							let type = commentMention ? 'commentMention' : 'postMention'
							firebase.database().ref('userNotifications/' + friend.uid).child(id).once('value', snapshot => {
								if (!snapshot.val()) {
									firebase.database().ref('notifications').child(id).set({date: item.createdAt, uid: item.uid, postId: key, type})
										.then(()=> firebase.database().ref('userNotifications/' + friend.uid).child(id).set(true))
										.then(() => upUnreadCount(friend.uid))
								}
							})
						}

					}
				}
			})
		}
	}
}

export const fetchPost = (key) => {
	return (dispatch, getState) => {
		return new Promise(resolve => {
			let uid = getState().profile.profile.uid
			firebase.database().ref('posts').child(key).once('value', snapshot => {
				let post = snapshot.val()
				post.key = snapshot.key
				firebase.database().ref('userReps/' + uid).child(key).once('value', snapshot => {
					if (snapshot.val()) {
						post.rep = true
					}
					if (!getState().friends.friends[post.uid] && !getState().sharedInfo.users[post.uid]) {
						fetchUser(post.uid).then(user => {
							let sharedUsers = {}
							sharedUsers[post.uid] = user
							dispatch(updateUsers(sharedUsers))
							dispatch(setPost(post))
							resolve()
						})
					}
					else {
						dispatch(setPost(post))
						resolve()
					}
				})
			})
	})
	}
}


export const fetchPosts = (uid, amount = 30, endAt) => {
	return (dispatch, getState) => {
		let promises = []
		return new Promise(resolve => {
			let ref = endAt ? firebase.database().ref('userPosts/' + uid).orderByKey().endAt(endAt).limitToLast(amount) :
			firebase.database().ref('userPosts/' + uid).orderByKey().limitToLast(amount)
			ref.on('value', snapshot => {
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
							let friends = getState().friends.friends
							if (post.val().uid == uid || friends[post.val().uid] && friends[post.val().uid].status == 'connected') {
								feed[post.key] = post.val()
								feed[post.key].key = post.key
								reps.push(firebase.database().ref('userReps/' + uid).child(post.key).once('value'))
								users.push(firebase.database().ref('users/' + post.val().uid).once('value'))
							}

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
		repSound.play()
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
					if (snapshot.val()) {
						dispatch(sendMentionNotifs({text, uid, createdAt: created_at}, postId, true, snapshot.val()))
					}
					if (snapshot.val() && snapshot.val() != user.uid) {
						
						let date  = created_at
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
	let userFetches = []
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
            } else if (getState().friends.friends[obj.uid]){
              obj.user = getState().friends.friends[obj.uid]
			}
			else {
				if (getState().sharedInfo.users[obj.uid]) {
					obj.user = getState().sharedInfo.users[obj.uid]
				}
				else {
					if (!userFetches.includes(obj.uid)) {
						userFetches.push(obj.uid)
					}
					
				}
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
			  if (userFetches.length > 0) {
				fetchUsers(userFetches).then(users => {
					let sharedUsers = {}
					users.forEach(user => {
						if (user.uid) {
							sharedUsers[user.uid] = user
						}
					})
					dispatch(updateUsers(sharedUsers))
					commentsArray.forEach(comment => {
						if (!comment.user) {
							comment.user = getState().sharedInfo.users[comment.uid]
						}
					})
					dispatch(setPostComments(key, commentsArray))
				})
			  }
			  else {
				dispatch(setPostComments(key, commentsArray))
			  }
		  })

        })
      })
  }
}

export const repComment = (comment) => {
	return (dispatch, getState) => {
		repSound.play()
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
								.then(()=> firebase.database().ref('userNotifications/' + comment.uid).child(comment.key + uid).set(true))
								.then(() => upUnreadCount(comment.uid))
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
		let userFetches = []
		return firebase.database().ref('reps').child(postId).limitToLast(limit).once('value', snapshot => {
			let users = []
			if (snapshot.val()) {
				Object.keys(snapshot.val()).forEach(uid => {
					let user = {}
					let profile
					if (uid == getState().profile.profile.uid) {
						profile = getState().profile.profile
						user.username = 'You'
						user.image = profile.avatar
						user.user_id = uid
						users.push(user)
					}
					else if (getState().friends.friends[uid]) {
						profile = getState().friends.friends[uid]
						user.username = profile.username
						user.image = profile.avatar
						user.user_id = uid
						users.push(user)
					}
					else {
						if (getState().sharedInfo.users[uid]) {
							profile = getState().sharedInfo.users[uid]
							user.username = profile.username
							user.image = profile.avatar
							user.user_id = uid
							users.push(user)
						}
						else {
							if (!userFetches.includes(uid)) {
								userFetches.push(uid)
							}
						}
					}
					
				})
			}
			let post = getState().home.feed[postId]
			if (userFetches.length > 0) {
				return fetchUsers(userFetches).then(fetched => {
					let sharedUsers = {}
					fetched.forEach(user => {
						if (user.uid) {
							sharedUsers[user.uid] = user
							user.image = user.avatar
							user.user_id = user.uid
							users.push(user)
						}
					})
					post.repUsers = users
					dispatch(setPost(post))
					dispatch(updateUsers(sharedUsers))

				})
			}
			else {
				post.repUsers = users
				dispatch(setPost(post))
			}
		})
	}
}



export const fetchCommentRepsUsers = (comment, limit = 10) => {
	return (dispatch, getState) => {
		let userFetches = []
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
							user.image = profile.avatar
							user.user_id = uid
							users.push(user)
						}
						else if (getState().friends.friends[uid]) {
							profile = getState().friends.friends[uid]
							user.username = profile.username
							user.image = profile.avatar
							user.user_id = uid
							users.push(user)
						}
						else {
							if (getState().sharedInfo.users[uid]) {
								profile = getState().sharedInfo.users[uid]
								user.image = profile.avatar
								user.user_id = uid
								users.push(user)
							}
							else {
								if (!userFetches.includes(uid)) {
									userFetches.push(uid)
								}
							}
						}
						
					})
				}
				
				let postComments = getState().home.feed[postId].comments
				if (userFetches.length > 0) {
					fetchUsers(userFetches).then(fetched => {
						let sharedUsers = {}
						fetched.forEach(user => {
							if (user.uid) {
								sharedUsers[user.uid] = user
								user.image = user.avatar
								user.user_id = user.uid
								users.push(user)
							}
						})
						postComments[comment_id-1].likes = users
						resolve(users)
						dispatch(setPostComments(postId, postComments))
						dispatch(updateUsers(sharedUsers))

	
					})
				}
				else {
					postComments[comment_id-1].likes = users
					resolve(users)
					dispatch(setPostComments(postId, postComments))
				}
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
			if (snapshot.val()) {
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
			}
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

export const deleteNotification = (key) => {
	return (dispatch, getState) => {
		let uid = getState().profile.profile.uid
		let notifs = getState().home.notifications
		delete notifs[key]
		dispatch(setNotifications(notifs))
		let ref = firebase.database().ref('notifications').child(key).remove()
		let ref1 = firebase.database().ref('userNotifications/' + uid).child(key).remove()
		return Promise.all([ref, ref1])
	}
}


export const fetchUser = (uid) => {
		return new Promise(resolve => {
			firebase.database().ref('users/' + uid).once('value', profile => {
				firebase.storage().ref('images/' + uid).child('avatar').getDownloadURL()
				.then(url => {
					resolve({...profile.val(), avatar: url})
				})
				.catch(e => {
					resolve({...profile.val()})
				})
		})
		})
		
}

export const fetchUsers = (uids) => {
	let promises = []
	uids.forEach(uid => {
		promises.push(new Promise(resolve => {
			firebase.database().ref('users/' + uid).once('value', profile => {
				firebase.storage().ref('images/' + uid).child('avatar').getDownloadURL()
					.then(url => {
						resolve({...profile.val(), avatar: url})
					})
					.catch(e => {
						resolve({...profile.val()})
					})
			})
			}))
		})
		return Promise.all(promises)
}
