import Profile from './Profile';

export default interface Comment {
  created_at: string;
  key: string;
  parentCommentId: boolean;
  postId: string;
  text: string;
  uid: string;
  childrenCount?: number;
  children?: Comment[];
  repCount?: number;
  rep?: boolean;
  comment_id: string;
  updated_at?: string;
  //user: Profile;
  reported?: boolean;
}
