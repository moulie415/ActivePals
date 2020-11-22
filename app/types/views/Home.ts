import Profile from '../Profile';
import Post from '../Post';
import Comment from '../Comment';
import Rep from '../Rep';
import {YourLocation} from '../Location';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';

type HomeNavigationProp = StackNavigationProp<StackParamList, 'Home'>;

export default interface HomeProps {
  profile: Profile;
  feed: {[key: string]: Post};
  friends: {[key: string]: Profile};
  users: {[key: string]: Profile};
  repsUsers: {[key: string]: Rep};
  postStatus: (status: Post) => void;
  onRepPost: (item: Post) => void;
  comment: (uid, postId, text, created_at, parentCommentId) => void;
  getComments: (key: string, amount?: number, fromComment?: string) => void;
  onRepComment: (comment: Comment) => void;
  getPosts: (uid: string, amount?: number, endAt?: string) => void;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
  getRepsUsers: (postId: string, limit?: number) => void;
  getReplies: (parentComment: Comment, amount: number, key: string) => void;
  navigation: HomeNavigationProp;
  location?: YourLocation;
}
