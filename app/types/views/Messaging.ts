import Profile from '../Profile';
import Place from '../Place';
import Message from '../Message';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';
import Session from '../Session';
import {PushNotificationData} from '../Shared';

type MessagingNavigationProp = StackNavigationProp<StackParamList, 'Messaging'>;

export type MessagingRouteProp = RouteProp<StackParamList, 'Messaging'>;

export default interface MessagingProps {
  navigation: MessagingNavigationProp;
  route: MessagingRouteProp;
  profile: Profile;
  unreadCount: {[key: string]: number};
  onResetUnreadCount: (id: string) => void;
  onResetMessage: () => void;
  resetNotif: () => void;
  gym?: Place;
  messageSession: {[key: string]: Message};
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  getMessages: (
    id: string,
    amount: number,
    uid: string,
    endAt?: string,
  ) => void;
  getSessionMessages: (
    id: string,
    amount: number,
    isPrivate: boolean,
    endAt?: string,
  ) => void;
  getGymMessages: (id: string, amount: number, endAt?: string) => void;
  onUpdateLastMessage: (message: PushNotificationData) => void;
  sessions: {[key: string]: Session};
  message?: Message;
  notif?: PushNotificationData;
};
