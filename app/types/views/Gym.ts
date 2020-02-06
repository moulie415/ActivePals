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
  goToProfile: () => void;
  viewProfile: (uid: string) => void;
  getGym: (id: string) => void;
  join: (gym: Place) => void;
  removeYourGym: () => void;
  createSession: (gym: Place) => void;
  onOpenGymChat: (id: string) => void;
  createSessionWithFriends: (friends: Profile[], location: Place) => void;
}
