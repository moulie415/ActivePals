import { NavigationScreenProps } from 'react-navigation';
import Profile from '../Profile';

export default interface ProfileViewProps {
  navigation: NavigationScreenProps;
  friends: { [key: string]: Profile };
  profile: Profile;
  users: { [key: string]: Profile };
  goBack: () => void;
  remove: (uid) => void;
  request: (friendUid) => void;
  goToGym: (gym) => void;
}
