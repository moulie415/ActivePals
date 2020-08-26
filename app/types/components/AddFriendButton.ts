import Profile from "../Profile";

export default interface AddFriendButtonProps {
  profile: Profile;
  setModal: (show: boolean) => void;
}