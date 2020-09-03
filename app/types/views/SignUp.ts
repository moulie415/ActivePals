import {StackParamList} from '../../App';
import {StackNavigationProp} from '@react-navigation/stack';

export type SignUpNavigationProp = StackNavigationProp<
  StackParamList,
  'SignUp'
>;
export default interface SignUpProps {
  navigation: SignUpNavigationProp;
}
