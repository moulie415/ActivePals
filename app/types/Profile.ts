// export default interface Profile {
//   FCMToken: string;
//   accountType: AccountType;
//   email: string;
//   first_name?: string;
//   last_name?: string;
//   gym?: string;
//   uid: string;
//   unreadCount?: number;
//   username: string;
//   fb_login?: boolean;
//   birthday?: string;
//   avatar?: string;
//   friends?: { [key: string]: UserState };
//   chats?: { [key: string]: string };
//   activity?: string;
//   level?: string;
//   state?: UserState;
//   status?: string;
//   token?: string;
// }

// export default interface Profile {
//   email: string;
//   uid: string;
//   avatar?: string;
// };

export default interface Profile {
  [key: string]: any;
}

export enum AccountType {
  STANDARD = 'standard',
  ADMIN = 'admin',
}

export enum UserState {
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline',
}
