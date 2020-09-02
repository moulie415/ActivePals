import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';
import Session from '../Session';

type MessagingNavigationProp = StackNavigationProp<StackParamList, 'Messaging'>;

type MessagingRouteProp = RouteProp<StackParamList, 'Messaging'>;

export default interface MessagingInfoButtonProps {
  navigation: MessagingNavigationProp;
  route: MessagingRouteProp;
  tintColor?: string;
  sessions?: {[key: string]: Session};
}
