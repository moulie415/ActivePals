import {  handleNotification } from '../index'

export default async (message) => {
    // handle your message
    handleNotification(message)
    return Promise.resolve()
}