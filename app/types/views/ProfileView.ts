import Profile from '../Profile';
import { Navigation } from '../Shared';

export default interface ProfileViewProps {
  navigation: Navigation;
  friends: { [key: string]: Profile };
  profile: Profile;
  users: { [key: string]: Profile };
  goBack: () => void;
  remove: (uid) => void;
  request: (friendUid) => void;
  goToGym: (gym) => void;
}
