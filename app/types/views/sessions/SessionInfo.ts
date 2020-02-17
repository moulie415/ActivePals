import { NavigationStackProp } from 'react-navigation-stack';
import Profile from '../../Profile';
import Session from '../../Session';
import Place from '../../Place';

export default interface SessionInfoProps {
  navigation: NavigationStackProp;
  profile: Profile;
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  getSession: (key: string) => void;
  getPrivateSession: (key: string) => void;
  sessions: { [key: string]: Session };
  privateSessions: { [key: string]: Session };
  places: { [key: string]: Place };
  location: { lat: number; lon: number };
  remove: (key: string, type: string) => void;
  onAddUser: (session: string, isPrivate: boolean, uid: string) => void;
  muted: { [key: string]: boolean };
  onMuteChat: (id: string, mute: boolean) => void;
}
