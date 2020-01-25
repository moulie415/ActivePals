import Session from '../Session';

export default interface SessionsProps {
  sessions: { [key: string]: Session };
  setYourLocation: ({ lat, lon }) => void;
  getPlaces: (lat: number, lon: number, token: string) => { token: string };
  fetch: (radius: number) => void;
  radius: number;
  saveRadius: (radius: number) => void;
  location: { lat: number; lon: number };
  onOpenGymChat: (id: string) => void;
  viewGym: (id: string) => void;
  viewSession: (id: string, isPrivate?: boolean) => void;
}
