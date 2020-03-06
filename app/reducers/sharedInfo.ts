import { SET_LOGGED_OUT } from '../actions/profile';
import { SET_USER, UPDATE_USERS } from '../actions/home';

const initialState = {
  users: {},
};

export default function(state = initialState, action) {
  switch (action.type) {
    case UPDATE_USERS:
      return {
        ...state,
        users: { ...state.users, ...action.users },
      };
    case SET_USER:
      return {
        ...state,
        users: { ...state.users, [action.user.uid]: action.user },
      };
    case SET_LOGGED_OUT: {
      return initialState;
    }
    default:
      return state;
  }
}
