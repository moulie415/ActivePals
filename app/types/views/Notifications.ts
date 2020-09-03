import Profile from '../Profile';
import Notification from '../Notification';
import {NavigationStackProp} from 'react-navigation-stack';
import {ThemeType} from '@ui-kitten/components';

export default interface NotificationsProps {
  profile: Profile;
  notifications: {[key: string]: Notification};
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  fetchNotifications: (amount?: number) => void;
  setRead: () => void;
  onDelete: (key: string) => void;
  navigation: NavigationStackProp;
  eva?: ThemeType;
}
