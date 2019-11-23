import Profile from "../Profile";

export default interface ParsedTextProps {
    text: string;
    friends: { [key: string]: Profile };
    users: { [key: string]: Profile };
    profile: Profile;
    goToProfile: () => void;
    viewProfile: (uid: string) => void;
    disableOnPress: boolean;
    color: string;
}