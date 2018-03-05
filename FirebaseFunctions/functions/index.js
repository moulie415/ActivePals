const functions = require('firebase-functions')
const admin = require('firebase-admin')
const _ = require('lodash')

admin.initializeApp(functions.config().firebase)

exports.sendNewMessageNotification = functions.database.ref('/chats').onWrite(event => {
    console.log(event)
    const getValuePromise = admin.database()
                                 .ref('chats')
                                 .orderByKey()
                                 .limitToLast(1)
                                 .once('value')

    return getValuePromise.then(snapshot => {
        const { messages } = _.values(snapshot.val())[0]
        console.log(_.values(snapshot.val())[0])
        let message = messages[Object.keys(messages)[Object.keys(messages).length - 1]]
        console.log(messages)
        console.log(message)
        const { user, text, FCMToken, createdAt, _id } = message

        const payload = {
            notification: {
                title: user.name + ' sent you a message',
                body: text,
            },
            data: {
                username: user.name,
                uid: user._id,
                createdAt,
                _id,
            },
            token: FCMToken,
        }

        return admin.messaging()
                    .send(payload)
    })
})