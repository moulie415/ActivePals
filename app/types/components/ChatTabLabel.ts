import {ThemeType} from '@ui-kitten/components';

import Chat from '../Chat';

export default interface ChatTabLabelProps {
  unreadCount: {[key: string]: number};
  type: 'pals' | 'sessions' | 'gym';
  chats: {[key: string]: Chat};
  sessionChats: {[key: string]: Chat};
  gymChat: Chat;
  eva?: ThemeType;
};
