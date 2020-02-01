import Profile from '../Profile';
import Post from '../Post';
import Comment from '../../components/comments/Comment';
import { Navigation } from '../Shared';

export default interface PostViewProps {
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  profile: Profile;
  navigation: Navigation;
  feed: { [key: string]: Post };
  viewProfile: (uid: string) => void;
  onRepPost: (item: Post) => void;
  goToProfile: () => void;
  getRepsUsers: (postId: string, limit?: number) => void;
  getPost: (key: string) => void;
  getComments: (key: string, amount?: number) => void;
  comment: (uid: string, postId: string, text: string, created_at: string, parentCommentId: string) => void;
  onRepComment: (comment: Comment) => void;
  fullScreenVideo: (url: string) => void;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
}
