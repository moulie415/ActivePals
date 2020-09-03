import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import Profile from '../Profile';

type NotificationsButtonNavigationProp = StackNavigationProp<
  StackParamList,
  'Tabs'
>;

export default interface NotificationsButtonProps {
  navigation: NotificationsButtonNavigationProp;
  profile: Profile;
};
