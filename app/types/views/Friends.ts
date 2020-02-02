import Profile from '../Profile';

export default interface FriendsProps {
  profile: Profile;
  friends: { [key: string]: Profile };
  onOpenChat: (key: string, username: string, uid: string) => void;
  onRequest: (key: string) => void;
  getFriends: (uid: string, limit?: number, startAt?: string) => void;
  onRemove: (uid: string) => void;
  onAccept: (uid: string, friendUid: string) => void;
  viewProfile: (uid: string) => void;
}
