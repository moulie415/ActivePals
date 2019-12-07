import Profile from "../Profile";

export default interface RepsModalProps {
  uids: string[];
  isOpen: boolean;
  onClosed: () => void;
  profile: Profile;
  friends: Profile[];
  users: Profile[];
}
