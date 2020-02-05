import Message from './Message';

export default interface Chat {
  lastMessage: Message;
  key?: string;
  chatId?: string;
}
