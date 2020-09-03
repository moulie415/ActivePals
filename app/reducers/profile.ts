import {
  SET_PROFILE,
  SET_LOGGED_OUT,
  SET_HAS_VIEWED_WELCOME,
  ProfileActionTypes,
  SET_GYM,
  REMOVE_GYM,
  SET_LOCATION,
} from '../actions/profile';
import Profile from '../types/Profile';
import {SET_NOTIFICATION_COUNT} from '../actions/home';
import Place from '../types/Place';
import {YourLocation} from '../types/Location';

export interface ProfileState {
  profile: Profile;
  hasViewedWelcome: boolean;
  gym?: Place;
  unreadCount: number;
  location?: YourLocation;
}

const initialState: ProfileState = {
  profile: {},
  hasViewedWelcome: false,
  unreadCount: 0,
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_PROFILE:
      return {
        ...state,
        profile: action.profile,
      };
    case SET_HAS_VIEWED_WELCOME: {
      return {
        ...state,
        hasViewedWelcome: true,
      };
    }
    case SET_GYM:
      return {
        ...state,
        gym: action.gym,
      };
    case REMOVE_GYM:
      return {
        ...state,
        gym: undefined,
      };
    case SET_NOTIFICATION_COUNT:
      return {
        ...state,
        profile: {...state.profile, unreadCount: action.count},
      };
    case SET_LOCATION: {
      return {
        ...state,
        location: action.location,
      };
    }
    case SET_LOGGED_OUT:
      return {...initialState, hasViewedWelcome: state.hasViewedWelcome};
    default:
      return state;
  }
};

export default reducer;
