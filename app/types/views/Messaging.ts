import Profile from '../Profile';
import Place from '../Place';
import Message from '../Message';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface MessagingProps {
  navigation: NavigationStackProp;
  profile: Profile;
  unreadCount: { [key: string]: number };
  onResetUnreadCount: (id: string) => void;
  onResetMessage: () => void;
  resetNotif: () => void;
  gym: Place;
  messageSession: { [key: string]: Message };
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  getMessages: (id: string, amount: number, uid: string, endAt: string) => void;
  getSessionMessages: (id: string, amount: number, isPrivate: boolean, endAt: string) => void;
  getGymMessages: (id: string, amount: number, endAt: string) => void;
  onUpdateLastMessage: (message: Message) => void;
}
