import Place from '../../Place';
import Chat from '../../Chat';
import { NavigationStackProp } from 'react-navigation-stack';

export interface GymChatProps {
  gym: Place;
  gymChat: Chat;
  getChat: (id: string) => void;
  navigation: NavigationStackProp;
}
