import Session from '../../Session';
import Place from '../../Place';
import Profile from '../../Profile';
import {NavigationStackProp} from 'react-navigation-stack';

export default interface SessionsProps {
  sessions: {[key: string]: Session};
  privateSessions: {[key: string]: Session};
  setYourLocation: ({lat, lon}) => void;
  getPlaces: (
    lat: number,
    lon: number,
    token: string,
  ) => {token: string; loadMore: boolean};
  fetch: (radius: number) => void;
  radius: number;
  saveRadius: (radius: number) => void;
  location: {lat: number; lon: number};
  places: {[key: string]: Place};
  gym: Place;
  friends: {[key: string]: Profile};
  navigation: NavigationStackProp;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
};
