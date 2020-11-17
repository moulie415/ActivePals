import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';

type MapToggleNavigationProp = StackNavigationProp<StackParamList, 'Sessions'>;

export default interface MapToggleProps {
  navigation: MapToggleNavigationProp;
};
