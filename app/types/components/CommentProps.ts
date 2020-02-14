import Comment from "../Comment";
import Profile from "../Profile";

export default interface CommentProps {
  image: string;
  likesNr: number;
  username: string;
  body: string;
  likeAction: (comment: Comment) => void;
  updatedAt: string;
  liked: boolean;
  replyAction: (comment: Comment) => void;
  canEdit: boolean;
  reportAction: (comment: Comment) => void;
  likesTapAction: (comment: Comment) => void;
  usernameTapAction: (username: string, uid: string) => void;
  uid: string;
  reported: boolean;
  data: Comment;
  editComment: (comment: Comment) => void;
  deleteAction: (comment: Comment) => void;
  users: Profile[];
  viewingUserName: string;
  id: string;
  child: boolean;
  editAction: (comment: Comment) => void;
}
