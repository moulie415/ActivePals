import Profile from '../Profile';
import Post from '../Post';
import Comment from '../../components/comments/Comment';
import { NavigationStackProp } from 'react-navigation-stack';

export default interface PostViewProps {
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  profile: Profile;
  navigation: NavigationStackProp;
  feed: { [key: string]: Post };
  onRepPost: (item: Post) => void;
  getRepsUsers: (postId: string, limit?: number) => void;
  getPost: (key: string) => void;
  getComments: (key: string, amount?: number) => void;
  comment: (uid: string, postId: string, text: string, created_at: string, parentCommentId: string) => void;
  onRepComment: (comment: Comment) => void;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
}
