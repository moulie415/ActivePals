import Chat from "../../app/types/Chat"
import { MessageType } from "../../app/types/Message"

const chat1: Chat = {
  title: 'testchat',
  uid: 'qwerty',
  lastMessage: {
    _id: 'qwerty',
    text: 'hello world',
    user: {
      _id: 'qwerty',
      name: 'Henry Moule'
    },
    type: MessageType.MESSAGE,
    createdAt: 1581977610
  }
}

export default {
  qwert: chat1
}