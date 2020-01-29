export default interface Notification {
  date: string;
  type: NotificationType;
  uid: string;
  key: string;
  postId?: string;

export enum NotificationType {
  POST_REP = 'postRep',
  COMMENT_REP = 'commentRep',
  COMMENT = 'comment',
  FRIEND_REQUEST = 'friendRequest',
  COMMENT_MENTION = 'commentMention',
  POST_MENTION = 'postMention',
}
