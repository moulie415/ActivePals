const functions = require('firebase-functions')
const admin = require('firebase-admin')
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
        const { user, text, FCMToken, createdAt, _id } = snapshot.val()[Object.keys(snapshot.val())[0]]

        const payload = {
            data: {
                custom_notification: JSON.stringify({
                    body: text,
                    title: user.name + ' sent you a message',
                    priority: 'high',
                    sound: 'default'
                }),
                username: user.name,
                uid: user._id,
                createdAt,
                _id,
                avatar: user.avatar ,
                type: 'message'

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
        const { user, text, sessionId, createdAt, _id, sessionTitle } = snapshot.val()[Object.keys(snapshot.val())[0]] 
        const payload = {
            data: {
                custom_notification: JSON.stringify({
                    body: text,
                    title: user.name + ' sent a message to ' + sessionTitle,
                    priority: 'high',
                    sound: 'default'
                }),
                username: user.name,
                uid: user._id,
                createdAt,
                _id,
                avatar: user.avatar,
                type: 'sessionMessage',
                sessionId,
                sessionTitle

            },
            topic: sessionId,

        }

        return admin.messaging()
                    .send(payload)
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
                                sound: 'default'
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