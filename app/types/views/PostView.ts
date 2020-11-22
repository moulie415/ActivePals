import Profile from '../Profile';
import Post from '../Post';
import Comment from '../Comment';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';

type PostViewNavigationProp = StackNavigationProp<StackParamList, 'PostView'>;

type PostViewRouteProp = RouteProp<StackParamList, 'PostView'>;

export default interface PostViewProps {
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  profile: Profile;
  navigation: PostViewNavigationProp;
  route: PostViewRouteProp;
  feed: {[key: string]: Post};
  onRepPost: (item: Post) => void;
  getRepsUsers: (postId: string, limit?: number) => void;
  getPost: (key: string) => void;
  getComments: (key: string, amount?: number, endAt?: string) => void;
  getReplies: (parentComment: Comment, amount: number, key: string) => void;
  comment: (
    uid: string,
    postId: string,
    text: string,
    created_at: string,
    parentCommentId: string,
  ) => void;
  onRepComment: (comment: Comment) => void;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
}
