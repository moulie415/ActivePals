import Profile from '../Profile';
import {StackParamList} from '../../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type WelcomeNavigationProp = StackNavigationProp<StackParamList, 'Welcome'>;
type WelcomeRouteProp = RouteProp<StackParamList, 'Welcome'>;
export default interface WelcomeProps {
  viewedWelcome: () => void;
  profile: Profile;
  navigation: WelcomeNavigationProp;
  route: WelcomeRouteProp;
  onSave: () => void;
}
