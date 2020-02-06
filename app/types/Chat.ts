import Message from './Message';
import { SessionType } from './Session';

export default interface Chat {
  lastMessage: Message;
  key?: string;
  chatId?: string;
  uid?: string;
  type?: SessionType;
  title: string;
}
