import Profile from '../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';

type ProfileViewNavigationProp = StackNavigationProp<
  StackParamList,
  'ProfileView'
>;

type ProfileViewRouteProp = RouteProp<StackParamList, 'ProfileView'>;

export default interface ProfileViewProps {
  navigation: ProfileViewNavigationProp;
  route: ProfileViewRouteProp;
  friends: {[key: string]: Profile};
  profile: Profile;
  users: {[key: string]: Profile};
  remove: (uid: string) => void;
  request: (friendUid: string) => void;
  fetchUser: (uid: string) => void;
}
