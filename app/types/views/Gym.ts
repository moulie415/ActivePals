import { NavigationScreenProps } from 'react-navigation';
import Profile from '../Profile';
import Place from '../Place';

export default interface GymProps {
  navigation: NavigationScreenProps;
  friends: { [key: string]: Profile };
  location: { lat: number; lon: number };
  users: { [key: string]: Profile };
  profile: Profile;
  gym: Place;
  places: { [key: string]: Place };
  goToProfile: () => void;
  viewProfile: (uid: string) => void;
  fetchGym: (id: string) => void;
}
