import Post from "../Post";
import Profile from "../Profile";

export default interface RepsAndCommentsProps {
  item: Post;
  profile: Profile;
  setSpinner: (loading: boolean) => void;
  setFocusCommentInput: (focus: boolean) => void;
  setPostId: (key: string) => void;
  setShowCommentModal: (show: boolean) => void;
  getComments: (key: string) => void;
  onRepPost: (item: Post) => void;
}