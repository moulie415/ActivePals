import Profile from '../Profile';
import Place from '../Place';
import {NavigationStackProp} from 'react-navigation-stack';
import {ThemeType} from '@ui-kitten/components';

export default interface ProfileProps {
  profile: Profile;
  gym: Place;
  onLogoutPress: () => void;
  onSave: () => void;
  navigation: NavigationStackProp;
  eva?: ThemeType;
}
