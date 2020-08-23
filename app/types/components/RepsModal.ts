import Profile from "../Profile";
import Comment from "../../components/comments/Comment";
import Rep from "../Rep";
import { NavigationStackProp } from "react-navigation-stack";

export default interface RepsModalProps {
  id: string;
  isOpen: boolean;
  onClosed: () => void;
  profile: Profile;
  friends: Profile[];
  users: Profile[];
  repCount: number;
  navigation: NavigationStackProp;
  getCommentRepsUsers: (comment: Comment, limit?: number) => void;
  getRepUsers: (postId: string, limit?: number, endAt?: string) => void;
  isComment: boolean;
  repsUsers: { [key: string]: Rep };
}
