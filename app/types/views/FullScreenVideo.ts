import {StackNavigationProp} from '@react-navigation/stack';
import {StackParamList} from '../../App';
import {RouteProp} from '@react-navigation/native';

type FullScreenVideoNavigationProp = StackNavigationProp<
  StackParamList,
  'FullScreenVideo'
>;

type FullScreenVideoRouteProp = RouteProp<StackParamList, 'FullScreenVideo'>;
export default interface FullScreenVideoProps {
  navigation: FullScreenVideoNavigationProp;
  route: FullScreenVideoRouteProp;
};
