import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';
import {RouteProp} from '@react-navigation/native';
import Session from '../../Session';
import Place from '../../Place';
import Profile from '../../Profile';

type MapNavigationProp = StackNavigationProp<StackParamList, 'Map'>;

type MapRouteProp = RouteProp<StackParamList, 'Map'>;

export default interface MapProps {
  navigation: MapNavigationProp;
  route: MapRouteProp;
  sessions: {[key: string]: Session};
  privateSessions: {[key: string]: Session};
  radius: number;
  location?: {lat: number; lon: number};
  places: {[key: string]: Place};
  friends: {[key: string]: Profile};
}
