import Profile from "../Profile";
import { NavigationScreenProps } from 'react-navigation'

export default interface WelcomeProps {
    viewedWelcome: () => void;
    profile: Profile;
    navigation: NavigationScreenProps;
    goBack: () => void;
    goHome: () => void;
    onSave: () => void;
}