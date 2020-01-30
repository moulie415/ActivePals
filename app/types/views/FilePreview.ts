import Profile from '../Profile';
import { Navigation } from '../Shared';

export default interface FilePreviewProps {
  navigation: Navigation;
  friends: { [key: string]: Profile };
  profile: Profile;
  goBack: () => void;
  postStatus: (status) => void;
  setPostMessage: (url: string, text: string) => void;
}
