import Profile from '../Profile';
import Place from '../Place';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface GymProps {
  navigation: NavigationStackProp;
  friends: { [key: string]: Profile };
  location: { lat: number; lon: number };
  users: { [key: string]: Profile };
  profile: Profile;
  gym: Place;
  places: { [key: string]: Place };
  getGym: (id: string) => void;
  join: (gym: Place) => void;
  removeYourGym: () => void;
}
