import {StackParamList} from '../../App';
import {StackNavigationProp} from '@react-navigation/stack';

type SignUpNavigationProp = StackNavigationProp<StackParamList, 'SignUp'>;
export default interface SignUpProps {
  navigation: SignUpNavigationProp;
}
