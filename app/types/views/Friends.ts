import Profile from '../Profile';

export default interface FriendsProps {
  profile: Profile;
  friends: { [key: string]: Profile };
}
