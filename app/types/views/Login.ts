import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import Profile from '../Profile';

type LoginNavigationProp = StackNavigationProp<StackParamList, 'Login'>;

export default interface LoginProps {
  navigation: LoginNavigationProp;
  setProfile: (user: Profile) => void;
  setup: (profile: Profile) => void;
  hasViewedWelcome: boolean;
}
