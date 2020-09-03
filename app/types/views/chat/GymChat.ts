import Place from '../../Place';
import Chat from '../../Chat';
import {NavigationStackProp} from 'react-navigation-stack';
import Profile from '../../Profile';

export interface GymChatProps {
  gymChat: Chat;
  getChat: (id: string) => void;
  navigation: NavigationStackProp;
  places: {[key: string]: Place};
  profile: Profile;
}
