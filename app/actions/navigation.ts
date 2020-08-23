import { NavigationActions, NavigationContainer } from 'react-navigation';

let _navigator;

const setTopLevelNavigator = navigatorRef => {
  _navigator = navigatorRef;
};

const getNavigator = (): NavigationContainer => {
  return _navigator;
}

const navigate = (routeName, params?) => {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
};

const goBack = () => _navigator.dispatch(NavigationActions.back());

export default {
  navigate,
  goBack,
  setTopLevelNavigator,
  getNavigator
};
