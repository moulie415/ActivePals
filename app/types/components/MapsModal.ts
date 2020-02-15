import Place from '../Place';

export default interface MapModalProps {
  location: { lat: number, lon: number };
  isOpen: boolean;
  onClosed: () => void;
  places: { [key: string]: Place };
  handlePress: (location: { lat: number; lng: number; gym?: Place }) => void;
}
