import Profile from '../Profile';

export default interface FbFriendsModalProps {
  friends: {[key: string]: Profile};
  profile: Profile;
  isOpen: boolean;
  onClosed: () => void;
  request: (id: string) => void;
  getFbFriends: (token: string) => Promise<{[key: string]: Profile}>;
};
