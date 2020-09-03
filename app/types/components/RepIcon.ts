import {ThemeType} from '@ui-kitten/components';
import {ViewStyle} from 'react-native';

export default interface RepIconProps {
  size: number;
  eva?: ThemeType;
  style?: ViewStyle;
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}
