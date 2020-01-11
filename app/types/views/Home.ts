import Profile from '../Profile';
import Post from '../Post';
import Comment from '../Comment';
import Rep from '../Rep';

export default interface HomeProps {
  profile: Profile;
  feed: { [key: string]: Post };
  friends: { [key: string]: Profile };
  users: { [key: string]: Profile };
  repsUsers: { [key: string]: Rep };
  viewPost: (id: string) => void;
  goToProfile: () => void;
  viewProfile: (uid: string) => void;
  postStatus: (status: Post) => Promise<void>;
  onRepPost: (item: Post) => void;
  previewFile: (type: string, uri: string, message: boolean, text: string) => void;
  comment: (uid, postId, text, created_at, parentCommentId) => void;
  getComments: (key: string, amount?: number, fromComment?: string) => void;
  repComment: (comment: Comment) => void;
  getPosts: (uid: string, amount?: number, endAt?: string) => void;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
  getRepsUsers: (postId: string, limit?: number) => void;
  onNotificationPress: () => void;
  getProfile: () => void;
  getFriends: () => void;
  navigateFullScreenVideo: (uri: string) => void;
  getReplies: (parentComment: Comment, amount: number, key: string);
}
