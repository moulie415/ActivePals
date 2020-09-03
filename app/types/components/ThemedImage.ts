import {ThemeType} from '@ui-kitten/components';
import {Source} from 'react-native-fast-image';
import {ViewStyle} from 'react-native';

export default interface ThemeImageProps {
  size: number;
  eva?: ThemeType;
  source: number | Source;
  style?: ViewStyle;
  fill?: string;
};
