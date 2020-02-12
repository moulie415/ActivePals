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
    isChild: (comment: Comment) => boolean;
    parentIdExtractor: (comment: Comment) => string;
    keyExtractor: (item: Comment) => string;
    usernameExtractor: (item: Comment) => string;
    uidExtractor: (item: Comment) => string;
    editTimeExtractor: (item: Comment) => string;
    createdTimeExtractor: (item: Comment) => string;
    bodyExtractor: (item: Comment) => string;
    imageExtractor: (item: Comment) => string;
    likeExtractor: (item: Comment) => boolean;
    reportedExtractor: (item: Comment) => boolean;
    likesExtractor: (item: Comment) => void;
    likeCountExtractor: (item: Comment) => number;
    childrenCountExtractor: (item: Comment) => number;
    timestampExtractor: (item: Comment) => void;
    replyAction: (offset: number) => void;
    saveAction: (text: string, parentCommentId: string) => void;
    editAction: (text: string, comment: Comment) => void;
    reportAction: (item: Comment) => void;
    likeAction: (item: Comment) => void;
    likesTapAction: (item: Comment) => void;
    paginateAction: (fromComment: Comment, direction: string, parentComment: Comment | undefined) => void;
    getCommentRepsUsers: (comment: Comment, amount: number) => void;
    deleteAction: (comment: Comment) => void;
}