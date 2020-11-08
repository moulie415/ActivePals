import Profile from '../Profile';

export default interface FriendsModalProps {
  friends: {[key: string]: Profile};
  isOpen: boolean;
  onClosed: () => void;
  onContinue: (friends: string[]) => void;
  title?: string;
};
