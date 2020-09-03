import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import Profile from '../Profile';
import {RouteProp} from '@react-navigation/native';

type LoginNavigationProp = StackNavigationProp<StackParamList, 'Login'>;
type LoginRouteProp = RouteProp<StackParamList, 'Login'>;

export default interface LoginProps {
  navigation: LoginNavigationProp;
  route: LoginRouteProp;
  setProfile: (user: Profile) => void;
  setup: () => void;
  hasViewedWelcome: boolean;
  getProfile: () => void;
}
