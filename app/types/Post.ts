import Comment from './Comment';

export default interface Post {
  createdAt: string;
  text?: string;
  type: PostType;
  repCount?: number;
  commentCount?: number;
  uid: string;
  username?: string;
  comments?: Comment[];
  repUsers?: string[];
  key?: string;
  url?: string;
}

export enum PostType {
  STATUS = 'status',
  PHOTO = 'photo',
  VIDEO = 'video',
}
