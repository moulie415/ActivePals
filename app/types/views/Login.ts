import { Navigation } from '../Shared';

export default interface LoginProps {
  loggedIn: boolean;
  navigation: Navigation;
  onLogin: () => void;
  logout: () => void;
}
