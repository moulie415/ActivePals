import Place from '../../Place';
import Profile from '../../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';

type GymsNavigationProp = StackNavigationProp<StackParamList, 'Gyms'>;

export default interface GymsProps {
  fetch: (radius: number) => void;
  radius: number;
  saveRadius: (radius: number) => void;
  location?: {lat: number; lon: number};
  places: {[key: string]: Place};
  gym?: Place;
  friends: {[key: string]: Profile};
  navigation: GymsNavigationProp;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
};
