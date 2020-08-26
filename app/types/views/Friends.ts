import Profile from '../Profile';
import {NavigationStackProp} from 'react-navigation-stack';

export default interface FriendsProps {
  profile: Profile;
  friends: {[key: string]: Profile};
  onRequest: (key: string) => void;
  getFriends: (uid: string, limit?: number, startAt?: string) => void;
  onRemove: (uid: string) => void;
  onAccept: (uid: string, friendUid: string) => void;
  navigation: NavigationStackProp;
};
