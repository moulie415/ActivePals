import Profile from '../Profile';
import Place from '../Place';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface ProfileProps {
  profile: Profile;
  gym: Place;
  onLogoutPress: () => void;
  onSave: () => void;
  goToGym: (id: string) => void;
  navigation: NavigationStackProp;
}
