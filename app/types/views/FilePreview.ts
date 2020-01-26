import { NavigationScreenProps } from 'react-navigation';
import Profile from '../Profile';

export default interface FilePreviewProps {
  navigation: NavigationScreenProps;
  friends: { [key: string]: Profile };
  profile: Profile;
  goBack: () => void;
  postStatus: (status) => void;
  setPostMessage: (url: string, text: string) => void;
}
