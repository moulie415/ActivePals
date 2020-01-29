import Profile from '../Profile';

export default interface SettingsProps {
  profile: Profile;
  viewWelcome: (goBack: boolean) => void;
  onRemoveUser: () => void;
  viewCredits: () => void;
}
