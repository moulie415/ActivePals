const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Storage = require('@google-cloud/storage')
const storage = new Storage()
const bucket = 'anyone-80c08.appspot.com'
const _ = require('lodash')

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
        console.log(snapshot.val())
        const { user, text, FCMToken, createdAt, _id, chatId } = snapshot.val()[Object.keys(snapshot.val())[0]]

        const payload = {
            data: {
                custom_notification: JSON.stringify({
                    body: text,
                    title: user.name + ' sent you a message',
                    priority: 'high',
                    sound: 'default',
                    group: chatId,
                }),
                username: user.name,
                uid: user._id,
                createdAt,
                _id,
                avatar: user.avatar ,
                type: 'message',
                chatId

            },
            token: FCMToken,

        }

        return admin.messaging()
                    .send(payload)
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
        console.log(snapshot.val())
        const { user, text, sessionId, createdAt, _id, sessionTitle, type } = snapshot.val()[Object.keys(snapshot.val())[0]] 
        return admin.database().ref('/'+ type +'/' + sessionId).child('users').once('value', users => {
            let tokens = []
            users.forEach(child => {
                if (child.key !== user._id) {
                    tokens.push(admin.database().ref('/users/' + child.key).child("FCMToken").once('value'))
                }
            })
            return Promise.all(tokens).then(tokens => {
                let promises = []
                tokens.forEach(token => {
                    const payload = {
                        data: {
                            custom_notification: JSON.stringify({
                                body: text,
                                title: user.name + ' sent a message to ' + sessionTitle,
                                priority: 'high',
                                sound: 'default',
                                group: sessionId,
                            }),
                            username: user.name,
                            uid: user._id,
                            createdAt,
                            _id,
                            avatar: user.avatar,
                            type: 'sessionMessage',
                            sessionId,
                            sessionTitle,

                        },
                        token: token.val(),
                    }
                    promises.push(admin.messaging().send(payload))
                })
                return Promise.all(promises)
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
                                body: 'sent you a buddy request',
                                title: username,
                                priority: 'high',
                                sound: 'default',
                                group: 'REQUEST',
                            }),
                            type: 'buddyRequest'

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

exports.deleteUserData = functions.database.ref('/users/{id}').onDelete(event => {
    let uid = event.params.id
    admin.database().ref('userPosts').child(uid).once('value', posts => {
        Object.keys(posts.val()).forEach(key => {
            if (posts.val()[key] === uid) {
                admin.database().ref('posts/' + uid).child(key).remove()
            }
        })
        admin.database().ref('userPosts').child(uid).remove()
    }) 

    admin.database().ref('userReps').child(uid).once('value', reps => {
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
    })
    let path = 'images/' + uid + '/avatar'
    
    storage.bucket(bucket).file(path).delete().then(() => {
        return console.log(uid + ' avatar deleted')
    })
    .catch(e => {
        console.log(e.message)
    })
})