import Post from '../Post';

export default interface RepCommentCountProps {
  item: Post;
  setLikesModalVisible: (visible: boolean) => void;
  setRepsId: (id: string) => void;
  setRepCount: (count: number) => void;
  getRepsUsers: (key: string) => void;
  setPostId: (id: string) => void;
  setShowCommentModal: (show: boolean) => void;
  getComments: (id: string) => void;
}
