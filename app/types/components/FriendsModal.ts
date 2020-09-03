import Profile from '../Profile';

export default interface FriendsModalProps {
  friends: {[key: string]: Profile};
  title: string;
  isOpen: boolean;
  onClosed: () => void;
  onContinue: (friends: string[]) => void;
};
