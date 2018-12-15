const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const admin = require('firebase-admin')
const Storage = require('@google-cloud/storage')
const storage = new Storage()
const bucket = 'anyone-80c08.appspot.com'
const _ = require('lodash')
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
})

const APP_NAME = 'ActivePals'

admin.initializeApp(functions.config().firebase)

exports.sendNewMessageNotification = functions.database.ref('/chats/{id}').onWrite(event => {
    console.log(event)

    const getValuePromise = admin.database()
                                 .ref('chats')
                                 .child(event.params.id)
                                 .orderByKey()
                                 .limitToLast(1)
                                 .once('value')

    return getValuePromise.then(snapshot => {
        const { user, text, FCMToken, createdAt, _id, chatId, friendUid, image } = snapshot.val()[Object.keys(snapshot.val())[0]]
        let imageVal = image || ""
        return admin.database().ref('users/' + friendUid).child('FCMToken').once('value', snapshot => {
            const payload = {
                data: {
                    custom_notification: JSON.stringify({
                        body: text,
                        title: user.name + ' sent you a message',
                        priority: 'high',
                        sound: 'notif.wav',
                        id: chatId,
                        channel: "DIRECT_MESSAGES",
                        group: chatId,
                    }),
                    username: user.name,
                    uid: user._id,
                    createdAt,
                    _id,
                    avatar: user.avatar ,
                    type: 'message',
                    chatId,
                    image: imageVal,
                    priority: 'high',
                    contentAvailable: 'true',
                    content_available: 'true'
                },
                token: snapshot.val(),
    
            }
    
            return admin.messaging()
                        .send(payload)
        })

        
    })
})

exports.sendNewSessionMessageNotification = functions.database.ref('/sessionChats/{id}').onWrite(event => {
    console.log(event)

    const getValuePromise = admin.database()
    .ref('sessionChats')
    .child(event.params.id)
    .orderByKey()
    .limitToLast(1)
    .once('value')

    return getValuePromise.then(snapshot => {
        const { user, text, sessionId, createdAt, _id, sessionTitle, type, image } = snapshot.val()[Object.keys(snapshot.val())[0]]
        let imageVal = image || ""
        return admin.database().ref('/'+ type +'/' + sessionId).child('users').once('value', users => {
            let refs = []
            Object.keys(users.val()).forEach(child => {
                if (child !== user._id) {
                    refs.push(admin.database().ref('/users/' + child).child("FCMToken").once('value'))
                }
            })
            return Promise.all(refs).then(tokens => {
                let promises = []
                tokens.forEach(token => {
                    const payload = {
                        data: {
                            custom_notification: JSON.stringify({
                                body: text,
                                title: user.name + ' sent a message to ' + sessionTitle,
                                priority: 'high',
                                sound: 'notif.wav',
                                id: sessionId,
                                channel: "SESSION_MESSAGES",
                                group: sessionId,
                            }),
                            username: user.name,
                            uid: user._id,
                            createdAt,
                            _id,
                            avatar: user.avatar,
                            type: 'sessionMessage',
                            private: type,
                            sessionId,
                            sessionTitle,
                            image: imageVal,
                            priority: 'high',
			                contentAvailable: 'true',
                            content_available: 'true'
                        },
                        token: token.val(),
			
                    }
                    promises.push(admin.messaging().send(payload))
                    console.log("sent push to user with FCMToken: " + token.val())
                })
                return Promise.all(promises)
            })
        })
    })
})

exports.sendNewGymMessageNotification = functions.database.ref('/gymChats/{id}').onWrite(event => {
    console.log(event)

    const getValuePromise = admin.database()
    .ref('gymChats')
    .child(event.params.id)
    .orderByKey()
    .limitToLast(1)
    .once('value')

    return getValuePromise.then(snapshot => {
        console.log('snapshot')
        console.log(snapshot.val())
        const { user, text, createdAt, _id, gymId, gymName, image } = snapshot.val()[Object.keys(snapshot.val())[0]]
        let imageVal = image || ""
        return admin.database().ref('gyms/' + gymId).child('users').once('value', users => {
            let refs = []
            Object.keys(users.val()).forEach(child => {
                if (child !== user._id) {
                    refs.push(admin.database().ref('/users/' + child).child("FCMToken").once('value'))
                }
            })
            return Promise.all(refs).then(tokens => {
                let promises = []
                console.log('tokens')
                console.log(tokens)
                tokens.forEach(token => {
                    const payload = {
                        data: {
                            custom_notification: JSON.stringify({
                                body: text,
                                title: user.name + ' sent a message to ' + gymName,
                                priority: 'high',
                                sound: 'notif.wav',
                                id: gymId,
                                channel: "GYM_MESSAGES",
                                group: gymId,
                            }),
                            username: user.name,
                            uid: user._id,
                            createdAt,
                            _id,
                            avatar: user.avatar,
                            type: 'gymMessage',
                            gymId,
                            gymName,
                            image: imageVal,
                            priority: 'high',
			                contentAvailable: 'true',
                            content_available: 'true'
                        },
                        token: token.val(),
			
                    }
                    promises.push(admin.messaging().send(payload))
                    console.log("sent push to user with FCMToken: " + token.val())
                })
                return Promise.all(promises).catch(e => {
                    console.log(e)
                })
            })
        })
    })
})


exports.sendFriendRequestNotification = functions.database.ref('/users/{id}/friends/{friend}').onWrite(event => {
    console.log(event.params.id)
    console.log(event.params.friend)

    const getValuePromise = admin.database()
    .ref('/users')
    .child(event.params.id)
    .once('value')

    return getValuePromise.then(snapshot => {
        return new Promise(function(resolve, reject) {
            let user = snapshot.val()
            if (user.friends[event.params.friend] === 'incoming') {
                admin.database().ref('/users').child(event.params.friend).once('value', friend => {
                    const username = friend.val().username
                    const { FCMToken } = user
                    const payload = {
                        data: {
                            custom_notification: JSON.stringify({
                                body: 'sent you a pal request',
                                title: username,
                                priority: 'high',
                                sound: 'default',
                                id: 'REQUEST',
                                channel: 'REQUEST',
                                group: 'REQUEST',
                            }),
                            type: 'buddyRequest',
                            priority: 'high',
                            contentAvailable: 'true',
                            content_available: 'true'
                        },
                        token: FCMToken,
			    
                    }
                    resolve(admin.messaging().send(payload))
                })
            }
            else {
                resolve(null)
            }
        })
    })
})

exports.onFriendConnected = functions.database.ref('/users/{uid}/friends/{friendUid}').onWrite(event => {
    let uid = event.params.uid
    let friendUid = event.params.friendUid
    return admin.database().ref('users/' + uid + '/friends/' + friendUid).once('value', status => {
        if (status.val() === 'connected') {
            admin.database().ref('userPosts/' + uid).once('value', posts => {
                if (posts.val()) {
                    admin.database().ref('userPosts').child(friendUid).update(posts.val())
                }
            })
            return admin.database().ref('users/' + uid + '/chats').child(friendUid).once('value', chat1 => {
                admin.database().ref('users/' + friendUid + '/chats').child(uid).once('value', chat2 => {
                    if (!chat1.val() && !chat2.val()) {
                        return admin.database().ref('chats').push().then(chat => {
                          let systemMessage = {
                             _id: 1,
                             text: 'Beginning of chat',
                             createdAt: new Date().toString(),
                             system: true,
                         }
                         let promises = []
                         promises.push(admin.database().ref('chats/' + chat.key).push(systemMessage))
                         promises.push(admin.database().ref('users/' + uid + '/chats').child(friendUid).set(chat.key))
                         promises.push(admin.database().ref('users/' + friendUid + '/chats').child(uid).set(chat.key))
                         return Promise.all(promises)
                     })
                    }
                })
            })
        }
    })
})

exports.onFriendDeleted = functions.database.ref('/users/{uid}/friends/{friendUid}').onDelete(event => {
    let uid = event.params.uid
    let friendUid = event.params.friendUid

    admin.database().ref('users/' + uid + '/chats').child(friendUid).once('value', chat => {
        if (chat.val()) {
            admin.database().ref('chats').child(chat.val()).remove()
            admin.database().ref('users/' + uid + '/chats').child(friendUid).remove()
        }
    })

    admin.database().ref('userPosts').child(uid).once('value', posts => {
        if (posts.val()) {
            Object.keys(posts.val()).forEach(post => {
                if (posts.val()[post] === friendUid) {
                    admin.database().ref('userPosts/' + uid).child(post).remove()
                }
            })
        }
    })

    admin.database().ref('userReps').child(uid).once('value', reps => {
        if (reps.val()) {
            Object.keys(reps.val()).forEach(rep => {
                if (reps.val()[rep] === friendUid) {
                    admin.database().ref('posts/' + rep).child('repCount').once('value', count => {
                        if (count.val()) {
                            let newCount = count.val() - 1
                            admin.database().ref('posts/' + rep).child('repCount').set(newCount)
                        }
                        admin.database().ref('reps/' + rep).child(uid).remove()
                    })
                }
            })
        }
    })

    admin.database().ref('users/' + friendUid + '/friends').child(uid).remove()

})

exports.deleteUserData = functions.auth.user().onDelete((deleted) => {
    console.log(deleted)
    const uid = deleted.data.uid

    admin.database().ref('users').child(uid).once('value', user => {
        admin.database().ref('users').child(uid).remove()
        if (user.val().chats) {
            Object.keys(user.val().chats).forEach(key => {
                let chat = user.val().chats[key]
                admin.database().ref('chats').child(chat).remove()
                admin.database().ref('users/' + key + '/chats').child(uid).remove()
            })
        }
        if (user.val().username) {
            admin.database().ref('usernames').child(user.val().username).remove()
        }

        if (user.val().friends) {
            Object.keys(user.val().friends).forEach(friend => {
                admin.database().ref('users/' + friend + '/friends').child(uid).remove()
                admin.database().ref('userPosts').child(friend).once('value', posts => {
                    if (posts.val()) {
                        Object.keys(posts.val()).forEach(post => {
                            if (posts.val()[post] === uid) {
                                admin.database().ref('userPosts/' + friend).child(post).remove()
                            }
                        })
                    }
                })
            })
        }
    })

    admin.database().ref('userPosts').child(uid).once('value', posts => {
        if (posts.val()) {
            Object.keys(posts.val()).forEach(key => {
                if (posts.val()[key] === uid) {
                    admin.database().ref('posts/' + uid).child(key).remove()
                }
            })
            admin.database().ref('userPosts').child(uid).remove()
        }
    })

    admin.database().ref('userReps').child(uid).once('value', reps => {
        if (reps.val()) {
            Object.keys(reps.val()).forEach(rep => {
                admin.database().ref('reps/' + rep).child('post').once('value', post => {
                    admin.database().ref('posts/' + post.val()).child('repCount').once('value', count => {
                        let newCount = count.val() - 1
                        if (post.val().uid !== uid) {
                            admin.database().ref('posts/' + post.val()).child('repCount').set(newCount)
                        }
                        admin.database().ref('reps/' + rep).remove()
                    })
                })
            })
            admin.database().ref('userReps').child(uid).remove()
        }
    })

    let path = 'images/' + uid + '/avatar'

    storage.bucket(bucket).file(path).delete().then(() => {
        return console.log(uid + ' avatar deleted')
    })
    .catch(e => {
        console.log(e.message)
    })
})

exports.onComment = functions.database.ref('/comments/{id}').onCreate(event => {
    console.log(event)
    const getValuePromise = admin.database()
                                 .ref('comments')
                                 .child(event.params.id)
                                 .once('value')

    return getValuePromise.then(snapshot => {
        const { postId, text, uid, created_at } = snapshot.val()
        return admin.database().ref('posts').child(postId).once('value', snapshot => {
            const postUid = snapshot.val().uid
            const type = snapshot.val().type
            if (postUid !== uid) {
                return admin.database().ref('users').child(postUid).once('value', snapshot => {
                    const FCMToken = snapshot.val().FCMToken
                    return admin.database().ref('users').child(uid).once('value', snapshot => {
                        const username = snapshot.val().username
                        const payload = {
                            data: {
                                custom_notification: JSON.stringify({
                                    body: text,
                                    title: username + ' commented on your ' + type,
                                    priority: 'high',
                                    sound: 'notif.wav',
                                    id: postId,
                                    channel: "COMMENT",
                                    group: postId,
                                }),
                                username,
                                uid,
                                createdAt: created_at,
                                type: 'comment',
                                postId,
                                priority: 'high',
                                contentAvailable: 'true',
                                content_available: 'true'
                
                            },
                            token: FCMToken,
                           
                        }
                        return admin.messaging()
                                    .send(payload)
                    })
                })
            }
        })
    })
})

exports.onRep = functions.database.ref('/reps/{id}/{uid}').onWrite(event => {
    const id = event.params.id
    const uid = event.params.uid
    const getValuePromise = admin.database()
                                 .ref('reps/' + id)
                                 .child(uid)
                                 .once('value')

    return getValuePromise.then(snapshot => {
        const { type, date, post } = snapshot.val()
        let ref = type === 'post' ? 'posts' : 'comments'
            return admin.database().ref(ref).child(id).once('value', snapshot => {
                if (snapshot.val()) {
                const postUid = snapshot.val().uid
                const text = snapshot.val().text
                if (postUid !== uid) {
                    return admin.database().ref('users').child(postUid).once('value', snapshot => {
                        const FCMToken = snapshot.val().FCMToken
                        return admin.database().ref('users').child(uid).once('value', snapshot => {
                            const username = snapshot.val().username
                            const payload = {
                                data: {
                                    custom_notification: JSON.stringify({
                                        body: text,
                                        title: username + ' repped your ' + type,
                                        priority: 'high',
                                        sound: 'notif.wav',
                                        id,
                                        channel: "REP",
                                        group: id,
                                    }),
                                    username,
                                    uid,
                                    createdAt: date,
                                    type: 'rep',
                                    id,
                                    postId: post,
                                    priority: 'high',
                                    contentAvailable: 'true',
                                    content_available: 'true'
                                },
                                token: FCMToken,
                                
                            }
                            return admin.messaging()
                                        .send(payload)
                        })
                    })
                }
            }
            })
    })
})

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    // [END onCreateTrigger]
      // [START eventAttributes]
      const email = user.email; // The email of the user.
      const displayName = user.displayName; // The display name of the user.
      // [END eventAttributes]
    
      return sendWelcomeEmail(email, displayName);
    })

// Sends a welcome email to the given user.
function sendWelcomeEmail(email, username) {
    const mailOptions = {
      from: `${APP_NAME} <noreply@firebase.com>`,
      to: email,
    };
  
    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy our app.`;
    return mailTransport.sendMail(mailOptions).then(() => {
      return console.log('New welcome email sent to:', email);
    });
  }
