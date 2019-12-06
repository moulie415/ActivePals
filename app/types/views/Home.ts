import Profile from '../Profile';
import Post from '../Post';
import Comment from '../../components/comments/Comment';

export default interface HomeProps {
  profile: Profile;
  feed: { [key: string]: Post };
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  viewPost: (id: string) => void;
  goToProfile: () => void;
  viewProfile: (uid: string) => void;
  postStatus: (status: Post) => Promise<void>;
  onRepPost: (item: Post) => void;
  previewFile: (type: string, uri: string, message: string, text: string) => void;
  comment: (uid, postId, text, created_at, parentCommentId) => void;
  getComments: (key: string, amount: number) => void;
  repComment: (comment: Comment) => void;
  getPosts: (uid: string, amount: number, endAt) => void;
  getCommentRepsUsers: (comment: Comment, limit: number) => void;
  getRepUsers: (postId: string, limit: number) => void;
  onNotificationPress: () => void;
  getProfile: () => void;
  getFriends: () => void;
  navigateFullScreenVideo: (uri: string) => void;
}
