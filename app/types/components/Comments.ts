import Comment from "../Comment";
import Profile from "../Profile";

export default interface CommentsProps {
    commentCount?: number;
    data: Comment[];
    viewingUserName: string;
    initialDisplayCount: number;
    editMinuteLimit: number;
    focusCommentInput: boolean;
    childrenPerPage: number;
    users: Profile[];
    usernameTapAction:  (username: string, uid: string) => void;
    childPropName: string;
    isChild: (comment: Comment) => void;
    parentIdExtractor: (comment: Comment) => void;
    keyExtractor: (item: Comment) => void;
    usernameExtractor: (item: Comment) => void;
    uidExtractor: (item: Comment) => void;
    editTimeExtractor: (item: Comment) => void;
    createdTimeExtractor: (item: Comment) => void;
    bodyExtractor: (item: Comment) => void;
    imageExtractor: (item: Comment) => void;
    likeExtractor: (item: Comment) => void;
    reportedExtractor: (item: Comment) => void;
    likesExtractor: (item: Comment) => void;
    likeCountExtractor: (item: Comment) => void;
    childrenCountExtractor: (item: Comment) => void;
    timestampExtractor: (item: Comment) => void;
    replyAction: (offset: number) => void;
    saveAction: (text: string, parentCommentId: string) => void;
    editAction: (text: string, comment: Comment) => void;
    reportAction: (item: Comment) => void;
    likeAction: (item: Comment) => void;
    likesTapAction: (item: Comment) => void;
    paginateAction: (fromComment: Comment, direction: string, parentComment: Comment | undefined) => void;
    getCommentRepsUsers: (comment: Comment, amount: number) => void;
}