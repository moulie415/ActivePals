import Profile from '../Profile';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface ProfileViewProps {
  navigation: NavigationStackProp;
  friends: { [key: string]: Profile };
  profile: Profile;
  users: { [key: string]: Profile };
  goBack: () => void;
  remove: (uid) => void;
  request: (friendUid) => void;
  goToGym: (gym) => void;
}
