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
}
