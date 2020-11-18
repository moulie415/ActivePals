import Profile from '../Profile';
import Place from '../Place';
import {ThemeType} from '@ui-kitten/components';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';

type ProfileNavigationProp = StackNavigationProp<StackParamList, 'Profile'>;

export default interface ProfileProps {
  profile: Profile;
  gym?: Place;
  onLogoutPress: () => void;
  onSave: () => void;
  navigation: ProfileNavigationProp;
  eva?: ThemeType;
}
