import Profile from '../Profile';
import Place from '../Place';
import {StackParamList} from '../../App';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type GymNavigationProp = StackNavigationProp<StackParamList, 'Gym'>;

type GymRouteProp = RouteProp<StackParamList, 'Gym'>;

export default interface GymProps {
  navigation: GymNavigationProp;
  route: GymRouteProp;
  friends: {[key: string]: Profile};
  location: {lat: number; lon: number};
  users: {[key: string]: Profile};
  profile: Profile;
  gym: Place;
  places: {[key: string]: Place};
  getGym: (id: string) => void;
  join: (gym: Place) => void;
  removeYourGym: () => void;
}
