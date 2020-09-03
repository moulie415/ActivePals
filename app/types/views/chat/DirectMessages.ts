import {NavigationStackProp} from 'react-navigation-stack';
import Profile from '../../Profile';
import Chat from '../../Chat';

export default interface DirectMessagesProps {
  navigation: NavigationStackProp;
  friends: {[key: string]: Profile};
  profile: Profile;
  chats: {[key: string]: Chat};
};
