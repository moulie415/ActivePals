import Place from '../Place';

export default interface LocationSearchModalProps {
  onPress: (gym: Place) => void;
  onClosed: () => void;
  isOpen: boolean;
}
