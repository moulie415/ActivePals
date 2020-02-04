import { NavigationActions } from 'react-navigation';

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const navigate = (routeName, params?) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
};

const goBack = () => _navigator.dispatch(NavigationActions.back());

export const navigateLogin = () => {
  return dispatch => {
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'Login',
        }),
      ],
    });
    dispatch(resetAction);
  };
};

export default {
  navigate,
  goBack,
  setTopLevelNavigator,
};
