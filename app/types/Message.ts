import {IMessage} from 'react-native-gifted-chat';

export default interface Message extends IMessage {
  FCMToken?: string;
  _id: string;
  chatId?: string;
  friendUid?: string;
  text: string;
  sessionId?: string;
  sessionTitle?: string;
  type: MessageType;
  sessionType?: SessionType;
  image?: string;
  user: MessageUser;
  key?: string;
};

export interface MessageUser {
  _id: string;
  avatar?: string;
  name: string;
}

export enum MessageType {
  MESSAGE = 'message',
  SESSION_MESSAGE = 'sessionMessage',
  GYM_MESSAGE = 'gymMessage',
}

export type SessionType = 'sessions' | 'privateSessions';
