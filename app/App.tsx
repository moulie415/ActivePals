import React, {FunctionComponent} from 'react';
import {ImageProps, StyleSheet} from 'react-native';
import {
  ApplicationProvider,
  Button,
  Icon,
  IconRegistry,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {ThemeContext} from './context/themeContext';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, Header} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './views/Login';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {persistStore} from 'redux-persist';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';
import SignUp from './views/SignUp';

// @ts-ignore
const composeEnhancers =
  // @ts-ignore
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunk)),
);

export const persistor = persistStore(store);

export type StackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<StackParamList>();
const Tab = createBottomTabNavigator<StackParamList>();

const App = () => {
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };
  return (
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <IconRegistry icons={EvaIconsPack} />
        <ThemeContext.Provider value={{theme, toggleTheme}}>
          {/* @ts-ignore */}
          <ApplicationProvider {...eva} theme={eva[theme]}>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen
                  options={() => ({headerShown: false})}
                  name="Login"
                  component={Login}
                />
                <Stack.Screen name="SignUp" component={SignUp} />
              </Stack.Navigator>
            </NavigationContainer>
          </ApplicationProvider>
        </ThemeContext.Provider>
      </Provider>
    </PersistGate>
  );
};

export default App;
