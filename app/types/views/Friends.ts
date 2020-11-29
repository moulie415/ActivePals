import Profile from '../Profile';
import {NavigationStackProp} from 'react-navigation-stack';
import {ThemeType} from '@ui-kitten/components';

export default interface FriendsProps {
  profile: Profile;
  friends: {[key: string]: Profile};
  onRequest: (key: string) => void;
  getFriends: (uid: string, limit?: number, startAt?: string) => void;
  onRemove: (uid: string) => void;
  onAccept: (uid: string, friendUid: string) => void;
  navigation: NavigationStackProp;
  setModal: (show: boolean) => void;
  modalOpen: boolean;
  eva?: ThemeType;
}
