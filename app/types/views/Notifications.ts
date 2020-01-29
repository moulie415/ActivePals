import Profile from '../Profile';
import Notification from '../Notification';

export default interface NotificationsProps {
  profile: Profile;
  notifications:{ [key: string]: Notification };
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  fetchNotifications: (amount?: number) => void;
  setRead: () => void;
  onDelete: (key: string) => void;
  goToFriends: () => void;
  viewPost: (id: string) => void;
}