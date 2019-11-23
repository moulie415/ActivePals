export default interface Post {
    createdAt: string;
    text?: string;
    type: PostType;
    repCount?: number;
    commentCount?: number;
    uid: string;
    username: string;
}

export enum PostType {
    STATUS = 'status',
    PHOTO = 'photo',
    VIDEO = 'video'
}