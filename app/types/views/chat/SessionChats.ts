import { NavigationStackProp } from 'react-navigation-stack';
import Chat from '../../Chat';
import Profile from '../../Profile';

export default interface SessionChatsProps {
  navigation: NavigationStackProp;
  chats: { [key: string]: Chat };
  profile: Profile;
  friends: { [key: string]: Profile };
}
