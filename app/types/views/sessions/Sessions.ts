import Session from '../../Session';
import Place from '../../Place';
import Profile from '../../Profile';
import {YourLocation} from '../../Location';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';

type SessionsNavigationProp = StackNavigationProp<StackParamList, 'Sessions'>;

export default interface SessionsProps {
  sessions: {[key: string]: Session};
  privateSessions: {[key: string]: Session};
  setYourLocation: (location: YourLocation) => void;
  getPlaces: (
    lat: number,
    lon: number,
    token?: string,
  ) => {token: string; loadMore: boolean};
  fetch: (radius: number) => void;
  radius: number;
  saveRadius: (radius: number) => void;
  location: {lat: number; lon: number};
  places: {[key: string]: Place};
  gym: Place;
  friends: {[key: string]: Profile};
  navigation: SessionsNavigationProp;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
}
