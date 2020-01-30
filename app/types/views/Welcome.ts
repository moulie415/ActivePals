import Profile from '../Profile';
import { Navigation } from '../Shared';

export default interface WelcomeProps {
  viewedWelcome: () => void;
  profile: Profile;
  navigation: Navigation;
  goBack: () => void;
  goHome: () => void;
  onSave: () => void;
}
