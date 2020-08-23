import Profile from '../Profile';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface WelcomeProps {
  viewedWelcome: () => void;
  profile: Profile;
  navigation: NavigationStackProp;
  onSave: () => void;
}
