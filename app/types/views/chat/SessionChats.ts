import Chat from '../../Chat';
import Profile from '../../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../../App';

export type SessionChatsNavigationProp = StackNavigationProp<
  StackParamList,
  'SessionChats'
>;
export default interface SessionChatsProps {
  navigation: SessionChatsNavigationProp;
  chats: {[key: string]: Chat};
  profile: Profile;
  friends: {[key: string]: Profile};
}
