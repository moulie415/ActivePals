import Profile from '../Profile'
import { NavigationScreenProps } from 'react-navigation'
import Post from '../Post'
import Comment from '../../comments/Comment'

export default interface PostViewProps {
    friends: { [key: string]: Profile };
    users: { [key: string]: Profile };
    profile: Profile;
    navigation: NavigationScreenProps;
    feed: { [key: string]: Post };
    viewProfile: (uid: string) => void;
    onRepPost: (item: Post) => void;
    goToProfile: () => void;
    getRepUsers: (postId: string, limit: number) => void;
    getPost: (key: string) => void;
    getComments: (key: string, amount: number) => void;
    comment: (
        uid: string,
        postId: string,
        text: string,
        created_at: string,
        parentCommentId: string
        ) => void;
    repComment: (comment: Comment) => void;
    navigateFullScreenVideo: (url: string) => void;
    getCommentRepsUsers: (comment: Comment, limit: number) => void;
}