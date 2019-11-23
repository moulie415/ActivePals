export default interface Profile {
    FCMToken: string;
    accountType: AccountType;
    email: string;
    first_name?: string;
    last_name?: string;
    gym?: string;
    uid: string;
    unreadCount?: number;
    username: string;
    fb_login?: boolean;
    birthday?: string;
    avatar?: string;
}

export enum AccountType {
    STANDARD = 'standard',
    ADMIN = 'admin'
}