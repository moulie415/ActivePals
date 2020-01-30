import firebase from 'react-native-firebase';
import Sound from 'react-native-sound';
import str from '../constants/strings';
import Profile from '../types/Profile';
import Comment from '../types/Comment';
import { dedupeSortAndAddCommentIds, sortComments } from '../constants/utils';

export const ADD_POST = 'ADD_POST';
export const SET_FEED = 'SET_FEED';
export const SET_POST = 'SET_POST';
export const SET_USER = 'SET_USER';
export const UPDATE_USERS = 'UPDATE_USERS';
export const SET_POST_COMMENTS = 'SET_POST_COMMENTS';
export const ADD_COMMENT = 'ADD_COMMENT';
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';
export const SET_NOTIFICATION_COUNT = 'SET_NOTIFICATION_COUNT';
export const SET_REPS_USERS = 'SET_REPS_USERS';

const repSound = new Sound('rep.wav', Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.log('failed to load the sound', error);
  }
});

const addToFeed = (post, id) => ({
  type: ADD_POST,
  post,
  id,
});

const setFeed = feed => ({
  type: SET_FEED,
  feed,
});

const setPost = post => ({
  type: SET_POST,
  post,
});

export const updateUsers = users => ({
  type: UPDATE_USERS,
  users,
});

const setPostComments = (post: string, comments: Comment[], incrementCount?: boolean) => ({
  type: SET_POST_COMMENTS,
  post,
  comments,
  incrementCount,
});

const setNotifications = notifications => ({
  type: SET_NOTIFICATIONS,
  notifications,
});

const setRepsUsers = (key: string, users) => ({
  type: SET_REPS_USERS,
  key,
  users,
});

export const setNotificationCount = (count) => ({
  type: SET_NOTIFICATION_COUNT,
  count,
})


export const addPost = (item) => {
	return (dispatch, getState) => {
		const uid = getState().profile.profile.uid
		const uids = Object.keys(getState().friends.friends)
		const ref = firebase.database().ref('posts').push()
		const key = ref.key
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
		const friends = Object.values(getState().friends.friends)
		const users = Object.values(getState().sharedInfo.users)
		const combined = [...friends, ...users]
		if (item.text) {
			const mentions = item.text.match(str.mentionRegex)
			if (mentions) {
				mentions.forEach(mention => {
					const username = mention.substring(1)
					const friend = combined.find(friend => friend.username == username)
					if (friend && friend.uid != postUid && friend.uid != item.uid) {
						//add notification for user
						const id = key + item.uid + 'mention'
						const type = commentMention ? 'commentMention' : 'postMention'
						firebase.database().ref('userNotifications/' + friend.uid).child(id).once('value', snapshot => {
							if (!snapshot.val()) {
								firebase.database().ref('notifications').child(id).set({date: item.createdAt, uid: item.uid, postId: key, type})
									.then(()=> firebase.database().ref('userNotifications/' + friend.uid).child(id).set(true))
									.then(() => upUnreadCount(friend.uid))
							}
						})
					}
				})
			}
		}
	}
}

export const fetchPost = key => {
  return (dispatch, getState) => {
    return new Promise(resolve => {
      const uid = getState().profile.profile.uid
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


export const fetchPosts = (uid, amount = 30, endAt?: string) => {
	return (dispatch, getState) => {
		let promises = []
		return new Promise(resolve => {
			let ref = endAt ? firebase.database().ref('userPosts/' + uid).orderByKey().endAt(endAt).limitToLast(amount) :
			firebase.database().ref('userPosts/' + uid).orderByKey().limitToLast(amount)
			ref.on('value', snapshot => {
				if (snapshot.val()) {
					Object.keys(snapshot.val()).forEach(post => {
						promises.push(firebase.database().ref('posts/' + post).once('value'))
						const ref = firebase.database().ref('posts/' + post)
						ref.on('child_changed', child => {
								if (child.key === 'repCount') {
									const obj = getState().home.feed[post]
									if (obj) {
										obj.repCount = child.val()
										dispatch(setPost(obj))
									}
								}
								else if (child.key == 'commentCount') {
									const obj = getState().home.feed[post]
									if (obj) {
										obj.commentCount = child.val()
										dispatch(setPost(obj))
									}
								}
						})
						ref.on('child_added', child => {
							if (child.key == 'repCount') {
								const obj = getState().home.feed[post]
								if (obj) {
									obj.repCount = child.val()
									dispatch(setPost(obj))
								}
							}
							else if (child.key == 'commentCount') {
								const obj = getState().home.feed[post]
								if (obj) {
									obj.commentCount = child.val()
									dispatch(setPost(obj))
								}
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
    const uid = getState().profile.profile.uid
    dispatch(setFeed({}))
    dispatch(fetchPosts(uid, 30))
  }
}

export const repPost = item => {
  return (dispatch, getState) => {
    repSound.play();
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
	return async (dispatch, getState) => {
		const location = parentCommentId ? 'commentReplies/' + parentCommentId : 'comments'
		const ref = firebase.database().ref(location).push()
		const key = ref.key
		await firebase.database().ref(location).child(key).set({uid, postId, text, created_at, parentCommentId, key})
		const commentCountRef = parentCommentId ? `comments/${parentCommentId}/childrenCount` : `posts/${postId}/commentCount`
		const snapshot = await firebase.database().ref(commentCountRef).once('value')
		let count
		if (snapshot.val()) {
			count = snapshot.val()
			count += 1
		}
		else count = 1
		const user = getState().profile.profile

		
		//add notification for user
		firebase.database().ref('posts/' + postId).child('uid').once('value', snapshot => {
			if (snapshot.val()) {
				dispatch(sendMentionNotifs({text, uid, createdAt: created_at}, postId, true, snapshot.val()))
			}
			if (snapshot.val() && snapshot.val() != user.uid) {
				
				const date  = created_at
				firebase.database().ref('notifications').child(key + user.uid).set({date, uid: user.uid, postId, type: 'comment'})
					.then(()=> firebase.database().ref('userNotifications/' + snapshot.val()).child(key + user.uid).set(true))
					.then(() => upUnreadCount(snapshot.val()))
			}
		})

		const obj = {uid, postId, text, created_at, parentCommentId, comment_id: count, user, key}
		let postComments = getState().home.feed[postId].comments || []
		if (!parentCommentId) {
			postComments.push(obj)
		}
		postComments = sortComments(postComments)
		if (parentCommentId) {
			postComments.forEach((comment) => {
				if (comment.key === parentCommentId) {
					if (comment.children) {
						comment.childrenCount = comment.childrenCount + 1
						comment.children.push({...obj, comment_id: comment.children.length + 1})
					}
					else {
						comment.childrenCount = 1
						comment.children = [{...obj, comment_id: 1}]
					}
				}
				
			})
		}
		//dispatch(addComment(postId, obj, count))
		dispatch(setPostComments(postId, postComments, !parentCommentId))
		await firebase.database().ref(commentCountRef).set(count)
		if (!parentCommentId) {
			firebase.database().ref('postComments/' + postId).child(key).set(uid)
		}
	}
}

export const fetchReplies = (comment: Comment, limit = 5, endAt?: string) => {
	return async (dispatch, getState) => {
		const key = comment.key
		const uid = getState().profile.profile.uid
		const friends = getState().friends.friends
		const users = getState().sharedInfo.users
		const currentComments = getState().home.feed[comment.postId].comments
		const filtered = currentComments.filter(c => c.key !== key)
		const userFetches = []
		const ref = endAt ? firebase.database().ref('commentReplies').child(key).orderByKey().endAt(endAt) :
		firebase.database().ref('commentReplies').child(key).orderByKey()
		const snapshot = await ref.limitToLast(limit).once('value')
		const currentChildren = comment.children || []

		const newReplies = Object.values(snapshot.val())

		const reps = await Promise.all(newReplies.map((reply: Comment) => {
			return firebase.database().ref("reps/" + reply.key).child(uid).once('value')
		}))

		const repliesWithReps = newReplies.map(reply => {
			if (reps.some(rep => rep.val() && rep.val().parentCommentId === key)) {
				return { ...reply, rep: true }
			}
			else return reply
		})

		const joined = [...currentChildren, ...repliesWithReps]
		
		comment.children = dedupeSortAndAddCommentIds(joined);

		comment.children.forEach(c => {
			if (!friends[c.uid] && !users[c.uid] && 
			!userFetches.includes(c.uid) && c.uid !== uid) {
				userFetches.push(c.uid)
			}
		})

		const postComments = dedupeSortAndAddCommentIds([...filtered, comment])

		dispatch(setPostComments(comment.postId, postComments))
		dispatch(fetchUsers(userFetches))
	}
}

export const fetchComments = (key: string, limit = 10, endAt?: string) => {
  return async (dispatch, getState) => {
    const userFetches = [];
    const { uid } = getState().profile.profile;
    const { friends } = getState().friends;
    const { users } = getState().sharedInfo;
    const ref = endAt
      ? firebase
          .database()
          .ref('postComments')
          .child(key)
          .orderByKey()
          .endAt(endAt)
      : firebase
          .database()
          .ref('postComments')
          .child(key)
          .orderByKey();
    const snapshot = await ref.limitToLast(limit).once('value');
    if (!snapshot.val()) {
      return dispatch(setPostComments(key, []));
    }
    const comments = await Promise.all(
      Object.keys(snapshot.val()).map(comment => {
        return firebase
          .database()
          .ref('comments')
          .child(comment)
          .once('value');
      })
    );

    let commentsArray = []
    const commentReps = []
    comments.forEach(comment => {
      const obj = comment.val()
      if (!friends[obj.uid] && !users[obj.uid] && !userFetches.includes(obj.uid) && obj.uid !== uid) {
        userFetches.push(obj.uid)
      }	
      commentReps.push(firebase.database().ref("reps/" + obj.key).child(uid).once('value'))
      commentsArray.push(obj)
    })

    const reps = await Promise.all(commentReps)
    reps.forEach((rep, index) => {
      if (rep.val()) {
        commentsArray[index].rep = true
      }
    })

    const commentsWithReplies = []
    commentsArray.forEach(comment => {
      if (comment.childrenCount) {
        commentsWithReplies.push(comment)
      }
    })

    const currentComments = getState().home.feed[key].comments || []

    commentsArray = dedupeSortAndAddCommentIds([...commentsArray, ...currentComments])
    dispatch(fetchUsers(userFetches))
    dispatch(setPostComments(key, commentsArray))
    await Promise.all(commentsWithReplies.map(comment => dispatch(fetchReplies(comment))))
  }
}

export const repComment = (comment: Comment) => {
	return async (dispatch, getState) => {
		repSound.play()
		const uid = getState().profile.profile.uid
		const parentCommentId = comment.parentCommentId
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
		if (parentCommentId) {
			postComments = postComments.map(c => {
				if (c.key === parentCommentId) {
					return { ...c, children: c.children = c.children.map(c => {
						 return c.key === comment.key ? comment : c
					})}
				}
				else return c
			})
		}
		else {
			postComments = postComments.map(c => {
				return (c.key === comment.key) ? comment : c
			})
		}
		dispatch(setPostComments(comment.postId, postComments))
		if (rep) {
			await firebase.database().ref('reps/' + comment.key).child(uid).set({
				date,
				uid, 
				post: comment.postId,
				type: 'comment',
				parentCommentId
			})
			const ref = parentCommentId ? `commentReplies/${parentCommentId}/${comment.key}` :  'comments/' + comment.key
			const snapshot = await firebase.database().ref(ref).child('repCount').once('value')
			let count
			if (snapshot.val()) {
				count = snapshot.val()
				count += 1
			}
			else count = 1
			await firebase.database().ref(ref).child('repCount').set(count)
			await firebase.database().ref('userReps/' + uid).child(comment.key).set(rep)
			if (uid !== comment.uid) {
				//add notification for user
				const snapshot = await firebase.database().ref('userNotifications/' + comment.uid).child(comment.key + uid).once('value')
				if (!snapshot.val()) {
					await firebase.database().ref('notifications').child(comment.key + uid).set({
						date,
						uid,
						postId: comment.postId,
						type: 'commentRep',
						parentCommentId
					})
					await firebase.database().ref('userNotifications/' + comment.uid).child(comment.key + uid).set(true)
					upUnreadCount(comment.uid)
				}
			}
		}
		else {
			await firebase.database().ref('reps/' + comment.key).child(uid).remove()
			const snapshot = await firebase.database().ref('comments/' + comment.key).child('repCount').once('value')
			let count
			if (snapshot.val()) {
				count = snapshot.val()
				count -= 1
			}
			else count = 0
			await firebase.database().ref('comments/' + comment.key).child('repCount').set(count)
			await firebase.database().ref('userReps/' + uid).child(comment.key).set(rep)
		}
	}
}

export const fetchRepsUsers = (postId: string, limit = 10, endAt?: string) => {
	return async (dispatch, getState) => {
		const ref = firebase.database().ref('reps').child(postId)
		const snapshot = endAt ? await ref.limitToLast(limit).endAt(endAt).once('value') : await ref.limitToLast(limit).once('value')
			if (snapshot.val()) {
				const uids =  Object.keys(snapshot.val())
				const userFetches = uids.filter(uid => {
					return uid !== getState().profile.profile.uid && !getState().friends.friends[uid] && ! getState().sharedInfo.users[uid]
				})
				dispatch(setRepsUsers(postId, snapshot.val()))
				dispatch(fetchUsers(userFetches))
			}
		}
	}

export const fetchCommentRepsUsers = (comment: Comment, limit = 10) => {
	return async (dispatch, getState) => {
		const { key, postId, comment_id } = comment
		const snapshot = await firebase.database().ref('reps').child(key).limitToLast(limit).once('value')
		if (snapshot.val()) {
			const uids =  Object.keys(snapshot.val())
			const userFetches = uids.filter(uid => {
				return uid !== getState().profile.profile.uid && !getState().friends.friends[uid] && ! getState().sharedInfo.users[uid]
			})
			dispatch(fetchUsers(userFetches))
			return uids
		}
	}
}

export const getNotifications = (limit = 10) => {
	return async (dispatch, getState) => {
		const uid = getState().profile.profile.uid
		const refs = []
		const snapshot = await firebase.database().ref('userNotifications').child(uid).limitToLast(limit).once('value')
		if (snapshot.val()) {
			Object.keys(snapshot.val()).forEach(key => {
				refs.push(firebase.database().ref('notifications').child(key).once('value'))
			})
			const notifications = await Promise.all(refs)
			let obj = {}
			notifications.forEach(notification => {
				obj[notification.key] = notification.val()
				obj[notification.key].key = notification.key
			})
			dispatch(setNotifications(obj))
		}
	}
}

export const upUnreadCount = async (uid) => {
	const snapshot = await firebase.database().ref('users/' + uid).child('unreadCount').once('value')
	let count = 1
	if (snapshot.val()) {
		count = snapshot.val() + 1
	}
	await firebase.database().ref('users/' + uid).child('unreadCount').set(count)
}

export const setNotificationsRead = () => {
	return (dispatch, getState) => {
		const uid = getState().profile.profile.uid
		dispatch(setNotificationCount(0))
		return firebase.database().ref('users/' + uid).child('unreadCount').set(0)
		
	} 
}

export const deleteNotification = (key) => {
	return async (dispatch, getState) => {
		const uid = getState().profile.profile.uid
		const notifs = getState().home.notifications
		delete notifs[key]
		dispatch(setNotifications(notifs))
		await firebase.database().ref('notifications').child(key).remove()
		await firebase.database().ref('userNotifications/' + uid).child(key).remove()
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
					resolve(profile.val())
				})
			})
		})
		
}

export const fetchUsers = (uids: string[]) => {
	return async (dispatch) => {
		if (uids.length > 0) {
			const users: Profile[] = await Promise.all(uids.map(uid => {
				return new Promise(async resolve => {
					const profile = await firebase.database().ref('users/' + uid).once('value')
					try {
						const url = await firebase.storage().ref('images/' + uid).child('avatar').getDownloadURL()
						resolve({...profile.val(), avatar: url})
					} catch(e) {
						resolve(profile.val())
					}
				})
			}))
			const sharedUsers = {}
			users.forEach(user => {
				if (user.uid) {
					sharedUsers[user.uid] = user
				}
			})
			dispatch(updateUsers(sharedUsers))
			return sharedUsers
		}
	}
}
