import { newNotification, updateLastMessage } from 'Anyone/js/actions/chats'
import type { RemoteMessage } from 'react-native-firebase'
import { showLocalNotification, store } from '../index'

export default async (message: RemoteMessage) => {
    // handle your message
    const { dispatch } = store
    dispatch(newNotification(message.data))
    dispatch(updateLastMessage(message.data))
    showLocalNotification(message.data)
    return Promise.resolve();
}