import Profile from '../../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';
import {RouteProp} from '@react-navigation/native';

type SessionDetailNavigationProp = StackNavigationProp<
  StackParamList,
  'SessionInfo'
>;

type SessionDetailRouteProp = RouteProp<StackParamList, 'SessionInfo'>;
export default interface SessionDetailProps {
  navigation: SessionDetailNavigationProp;
  route: SessionDetailRouteProp;
  profile: Profile;
  getSessions: () => void;
};
