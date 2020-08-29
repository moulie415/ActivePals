import Profile from '../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {StackParamList} from '../../App';
import Post from '../Post';

type FilePreviewNavigationProp = StackNavigationProp<
  StackParamList,
  'FilePreview'
>;
type FilePreviewRouteProp = RouteProp<StackParamList, 'FilePreview'>;

export default interface FilePreviewProps {
  navigation: FilePreviewNavigationProp;
  route: FilePreviewRouteProp;
  friends: {[key: string]: Profile};
  profile: Profile;
  postStatus: (status: Post) => void;
  setPostMessage: (url: string, text: string) => void;
};
