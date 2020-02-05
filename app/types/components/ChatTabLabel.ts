import Chat from '../Chat';

export default interface ChatTabLabelProps {
  unreadCount: { [key: string]: number };
  color: string;
  type: 'pals' | 'sessions' | 'gym';
  chats: { [key: string]: Chat };
  sessionChats: { [key: string]: Chat };
  gymChat: Chat;
}
