import {
  SET_FRIENDS,
  ADD_FRIEND,
  UPDATE_FRIEND_STATE,
  SET_FRIEND,
  SET_MODAL,
} from '../actions/friends';
import {SET_LOGGED_OUT} from '../actions/profile';
import Profile from '../types/Profile';

export interface FriendsState {
  friends: {[key: string]: Profile};
  modalOpen: boolean;
}

const initialState: FriendsState = {
  friends: {},
  modalOpen: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_FRIENDS:
      return {
        ...state,
        friends: action.friends,
      };
    case SET_FRIEND:
      return {
        ...state,
        friends: {...state.friends, [action.friend.uid]: action.friend},
      };
    case ADD_FRIEND:
      return {
        ...state,
        friends: {...state.friends, [action.uid]: action.friend},
      };
    case UPDATE_FRIEND_STATE:
      return {
        ...state,
        friends: {
          ...state.friends,
          [action.uid]: {...state.friends[action.uid], state: action.state},
        },
      };
    case SET_MODAL:
      return {
        ...state,
        modalOpen: action.open,
      };
    case SET_LOGGED_OUT: {
      return initialState;
    }
    default:
      return state;
  }
}
