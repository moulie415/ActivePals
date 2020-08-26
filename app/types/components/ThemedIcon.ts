import {ThemeType} from '@ui-kitten/components';
import {ViewStyle} from 'react-native';

export default interface ThemeImageProps {
  size: number;
  eva?: ThemeType;
  name: string;
  style?: ViewStyle;
  fill?: string;
  status?: 'success' | 'danger';
}
