import React, {useState, useEffect} from 'react';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import database from '@react-native-firebase/database';
import * as eva from '@eva-design/eva';
import {ThemeContext} from './context/themeContext';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './views/Login';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {persistStore} from 'redux-persist';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducers';
import SignUp from './views/SignUp';
import {Theme} from './types/Shared';
import AsyncStorage from '@react-native-community/async-storage';
import Welcome from './views/Welcome';
import {GeoFire} from 'geofire';
import Home from './views/Home';

const firebaseRef = database().ref('locations');
export const geofire = new GeoFire(firebaseRef);

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
  Welcome: {goBack?: boolean};
  Home: undefined;
  Tabs: undefined;
};

const Stack = createStackNavigator<StackParamList>();
const Tab = createBottomTabNavigator<StackParamList>();

const Tabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
    </Tab.Navigator>
  );
};

const key = '@theme';

const App = () => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  useEffect(() => {
    const getTheme = async () => {
      const currentTheme = await AsyncStorage.getItem(key);
      if (currentTheme) {
        //@ts-ignore
        setTheme(currentTheme);
      }
    };
    getTheme();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(key, theme);
  }, [theme]);
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
                <Stack.Screen
                  name="Welcome"
                  component={Welcome}
                  options={() => ({headerShown: false})}
                />
                <Stack.Screen name="Tabs" component={Tabs} />
              </Stack.Navigator>
            </NavigationContainer>
          </ApplicationProvider>
        </ThemeContext.Provider>
      </Provider>
    </PersistGate>
  );
};

export default App;
