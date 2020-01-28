import { NavigationScreenProps } from 'react-navigation';
import Profile from '../Profile';
import Place from '../Place';
import Message from '../Message';

export default interface MessagingProps {
  navigation: NavigationScreenProps;
  profile: Profile;
  unreadCount: { [key: string]: number };
  onResetUnreadCount: (id: string) => void;
  onResetMessage: () => void;
  resetNotif: () => void;
  goBack: () => void;
  gym: Place;
  messageSession: { [key: string]: Message };
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  viewProfile: (uid: string) => void;
  goToProfile: () => void;
  viewSession: (id: string, isPrivate?: boolean) => void;
  onOpenChat: (chatId: string, friendUsername: string, friendUid: string) => void;
  previewFile: (type: string, uri: string, message: boolean, text: string) => void;
  getMessages: (id: string, amount: number, uid: string, endAt: string) => void;
  getSessionMessages: (id: string, amount: number, isPrivate: boolean, endAt: string) => void;
  getGymMessages: (id: string, amount: number, endAt: string) => void;
  goToGym: (id: string) => void;
  onUpdateLastMessage: (message: Message) => void;
}
