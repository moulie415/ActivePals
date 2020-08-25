import Profile from '../../Profile';
import Session from '../../Session';
import Place from '../../Place';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';
import {RouteProp} from '@react-navigation/native';

type SessionInfoNavigationProp = StackNavigationProp<
  StackParamList,
  'SessionInfo'
>;

type SessionInfoRouteProp = RouteProp<StackParamList, 'SessionInfo'>;

export default interface SessionInfoProps {
  navigation: SessionInfoNavigationProp;
  route: SessionInfoRouteProp;
  profile: Profile;
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  getSession: (key: string) => void;
  getPrivateSession: (key: string) => void;
  sessions: {[key: string]: Session};
  privateSessions: {[key: string]: Session};
  places: {[key: string]: Place};
  location: {lat: number; lon: number};
  remove: (key: string, type: string) => void;
  onAddUser: (session: string, isPrivate: boolean, uid: string) => void;
  muted: {[key: string]: boolean};
  onMuteChat: (id: string, mute: boolean) => void;
};
