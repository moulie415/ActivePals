import {ThemeType} from '@ui-kitten/components';

export default interface ChatTabBarIconProps {
  unreadCount: {[key: string]: number};
  color: string;
  eva?: ThemeType;
};
