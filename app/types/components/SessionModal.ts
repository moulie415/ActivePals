import Session from "../Session";
import Profile from "../Profile";

export default interface SessionModalProps {
    session: Session;
    disabled: boolean;
    profile: Profile;
    viewSession: (key: string, isPrivate: boolean) => void;
    viewGym: (id: string) => void;
    location: { lat: string; lon: string };
    openChat: (session: Session) => void;
    viewDirections: () => void;
    viewProfile: (uid: string) => void;
    join: (key: string, isPrivate: boolean) => void;
    remove: (key: string, isPrivate: boolean) => void 
    close: () => void;
    users: { [key: string]: Profile }
}