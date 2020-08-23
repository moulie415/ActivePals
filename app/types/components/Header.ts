export default interface HeaderProps {
  hasBack: boolean;
  onBackPress: () => void;
  customBackPress: (param: () => void) => void;
  title: string;
  fitTitle: boolean;
  backgroundColor: string;
  right: JSX.Element;
  left: JSX.Element;
}
