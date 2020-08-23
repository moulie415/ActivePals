import Location from './Location';
import Place from './Place';

export default interface Session {
  key?: string;
  dateTime: string;
  details: string;
  duration: number;
  durationMinutes: number;
  gender: Gender;
  host: string;
  location: Location;
  private?: boolean;
  title: string;
  type: SessionType;
  users: { [key: string]: boolean };
  inProgress?: boolean;
  distance?: number;
  gym?: string;
}

export enum Gender {
  UNSPECIFIED = 'Unspecified',
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum SessionType {
  CUSTOM = 'Custom',
  SWIMMING = 'Swimming',
  GYM = 'Gym',
  RUNNING = 'Running',
  CYCLING = 'Cycling',
}
