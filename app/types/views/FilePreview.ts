import Profile from '../Profile';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface FilePreviewProps {
  navigation: NavigationStackProp;
  friends: { [key: string]: Profile };
  profile: Profile;
  postStatus: (status) => void;
  setPostMessage: (url: string, text: string) => void;
}
