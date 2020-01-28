import { IMessage } from 'react-native-gifted-chat';

export default interface Message extends IMessage {
  FCMToken?: string;
  _id: string;
  chatId?: string;
  friendUid?: string;
  text: string;
  sessionId?: string;
  sessionTitle?: string;
  type?: string;
  image?: string;
  user: MessageUser;
}

export interface MessageUser {
  _id: string;
  avatar?: string;
  name: string;
}
