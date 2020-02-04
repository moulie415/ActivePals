import Profile from '../Profile';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface SettingsProps {
  profile: Profile;
  viewWelcome: (goBack: boolean) => void;
  onRemoveUser: () => void;
  viewCredits: () => void;
  navigation: NavigationStackProp;
}
