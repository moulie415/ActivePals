import Profile from '../Profile';
import Post from '../Post';
import Comment from '../Comment';
import Rep from '../Rep';
import {NavigationStackProp} from 'react-navigation-stack';
import {YourLocation} from '../Location';

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
  navigation: NavigationStackProp;
  location: YourLocation;
}
