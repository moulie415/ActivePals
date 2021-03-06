import Profile from '../Profile';
import {NavigationStackProp} from 'react-navigation-stack';

export default interface SettingsProps {
  profile: Profile;
  onRemoveUser: () => void;
  navigation: NavigationStackProp;
};
