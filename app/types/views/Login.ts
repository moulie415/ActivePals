import { NavigationStackProp } from 'react-navigation-stack';

export default interface LoginProps {
  loggedIn: boolean;
  navigation: NavigationStackProp;
  hasViewedWelcome: boolean;
  onLogin: () => void;
  logout: () => void;
}
