import { Position } from './Location';

export default interface Place {
  formatted_address: string;
  formatted_phone_number: string;
  geometry: Geometry;
  icon: string;
  id: string;
  photo: string;
  international_phone_number: string;
  name: string;
  place_id: string;
  rating: number;
  scope: string;
  types: string[];
  url: string;
  userCount?: number;
  user_ratings_total: number;
  users: { [key: string]: boolean };
  utc_offset: string;
  vicinity: string;
  website: string;
  opening_hours: OpeningHours;
}

interface OpeningHours {
  open_now: boolean;
  weekday_text: string[];
}

interface Geometry {
  location: Position;
  viewport: Viewport;
}

interface Viewport {
  northeast: Position;
  southwest: Position;
}
