import {persistCombineReducers} from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
import profile from './profile';
import friends from './friends';

const config = {
  key: 'root',
  storage: AsyncStorage,
};

// Combine all the reducers
export default persistCombineReducers(config, {
  profile,
  friends,
});
