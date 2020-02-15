import { NavigationStackProp } from "react-navigation-stack";
import Profile from "../../Profile";

export default interface SessionDetailProps {
  navigation: NavigationStackProp;
  profile: Profile;
  getSessions: () => void;
}