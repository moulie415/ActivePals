import Profile from '../Profile';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import Post from '../Post';
import {RefObject} from 'react';
import ActionSheet from 'react-native-actionsheet';
import Video from 'react-native-video';

type HomeNavigationProp = StackNavigationProp<StackParamList, 'Home'>;

export default interface PostProps {
  item: Post;
  profile: Profile;
  navigation: HomeNavigationProp;
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  setLikesModalVisible: (visible: boolean) => void;
  setRepsId: (id: string) => void;
  setRepCount: (count: number) => void;
  getRepsUsers: (key: string) => void;
  setPostId: (id: string) => void;
  setShowCommentModal: (show: boolean) => void;
  getComments: (id: string) => void;
  setSpinner: (loading: boolean) => void;
  onRepPost: (item: Post) => void;
  setFocusCommentInput: (focus: boolean) => void;
  setSelectedPost: (id: string) => void;
  actionSheetRef: RefObject<ActionSheet>;
  setShowImage: (show: boolean) => void;
  setSelectedImage: (image: {url: string}[]) => void;
  setPlaying: (playing: {[key: string]: boolean}) => void;
  players: RefObject<{[key: string]: Video}>;
  playing: {[key: string]: boolean};
};
