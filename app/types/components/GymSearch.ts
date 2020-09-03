import Place from "../Place";
import { Marker } from "react-native-maps";

export default interface GymSearchProps {
  onOpen: (id: string) => void;
  setSpinner: (show: boolean) => void;
  setSelectedLocation: (gym: Place) => void;
  setLatitude: (lat: number) => void;
  setLongitude: (lon: number) => void;
  setMarkers: (markers: Element[]) => void;
  markers: Element[];
}