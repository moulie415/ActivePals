import Profile from '../Profile';
import {NavigationStackProp} from 'react-navigation-stack';

export default interface ParsedTextProps {
  text: string;
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  profile: Profile;
  navigation: NavigationStackProp;
  disableOnPress: boolean;
  color: string;
}
