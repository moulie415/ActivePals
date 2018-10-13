// @flow
import firebase from 'react-native-firebase';
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase'
import { showLocalNotification } from '../index'

export default async (message: RemoteMessage) => {
    // handle your message
    showLocalNotification(message.data)
    return Promise.resolve();
}