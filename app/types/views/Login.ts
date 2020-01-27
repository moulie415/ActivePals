import { NavigationScreenProps } from 'react-navigation';

export default interface LoginProps {
  loggedIn: boolean;
  navigation: NavigationScreenProps;
  onLogin: () => void;
  logout: () => void;
}
