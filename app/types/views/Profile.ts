import Profile from '../Profile';
import Place from '../Place';

export default interface ProfileProps {
  profile: Profile;
  gym: Place;
  onLogoutPress: () => void;
  onSave: () => void;
  goToSettings: () => void;
  goToGym: (id: string) => void;
}
