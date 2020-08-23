import {
  SET_PROFILE,
  SET_LOGGED_IN,
  SET_LOGGED_OUT,
  SET_HAS_VIEWED_WELCOME,
  ProfileActionTypes,
} from '../actions/profile';
import Profile from '../types/Profile';

export interface ProfileState {
  profile: Profile;
  loggedIn: boolean;
  hasViewedWelcome: boolean;
}

const initialState: ProfileState = {
  profile: {},
  loggedIn: false,
  hasViewedWelcome: false,
};

const reducer = (state = initialState, action: ProfileActionTypes) => {
  switch (action.type) {
    case SET_PROFILE:
      return {
        ...state,
        profile: action.profile,
      };
    // case SET_LOGGED_IN:
    //   return {
    //     ...state,
    //     loggedIn: action.loggedIn,
    //   };
    case SET_HAS_VIEWED_WELCOME: {
      return {
        ...state,
        hasViewedWelcome: true,
      };
    }
    case SET_LOGGED_OUT:
      return {...initialState, hasViewedWelcome: state.hasViewedWelcome};
    default:
      return state;
  }
};

export default reducer;

// import {
//   SET_PROFILE,
//   SET_LOGGED_IN,
//   SET_LOGGED_OUT,
//   SET_GYM,
//   REMOVE_GYM,
//   SET_LOCATION,
//   SET_HAS_VIEWED_WELCOME,
// } from '../actions/profile';

// import { SET_NOTIFICATION_COUNT } from '../actions/home';

// const initialState = {
//   profile: {},
//   loggedIn: false,
//   hasViewedWelcome: false,
// };

// export default function(state = initialState, action) {
//   switch (action.type) {
//     case SET_PROFILE:
//       return {
//         ...state,
//         profile: action.profile,
//       };
//     case SET_LOGGED_IN:
//       return {
//         ...state,
//         loggedIn: action.loggedIn,
//       };
//     case SET_GYM:
//       return {
//         ...state,
//         gym: action.gym,
//       };
//     case REMOVE_GYM:
//       return {
//         ...state,
//         gym: null,
//       };
//     case SET_NOTIFICATION_COUNT:
//       return {
//         ...state,
//         profile: { ...state.profile, unreadCount: action.count },
//       };
//     case SET_LOCATION: {
//       return {
//         ...state,
//         location: action.location,
//       };
//     }
//     case SET_HAS_VIEWED_WELCOME: {
//       return {
//         ...state,
//         hasViewedWelcome: true,
//       };
//     }
//     case SET_LOGGED_OUT:
//       return { ...initialState, hasViewedWelcome: state.hasViewedWelcome };
//     default:
//       return state;
//   }
// }
