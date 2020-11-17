import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import Message from '../types/Message';
import Profile from '../types/Profile';
import {MyRootState} from '../types/Shared';

export const getProfileImage = (user: FirebaseAuthTypes.User) => {
  if (user.photoURL && user.providerData[0]) {
    const provider = user.providerData[0];
    if (provider.providerId === 'facebook.com') {
      return `${user.photoURL}?height=200`;
    }
    return user.photoURL;
  }
};

export const getAvatar = (message: Message, state: MyRootState) => {
  if (message.user) {
    const uid = message.user._id;
    const friends = state.friends.friends;
    const users = state.sharedInfo.users;
    if (friends[uid]) {
      return friends[uid].avatar;
    }
    if (users[uid]) {
      return users[uid].avatar;
    }
    return message.user.avatar;
  }
};
