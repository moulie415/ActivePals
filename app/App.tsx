import React from 'react';
import {ImageProps, StyleSheet} from 'react-native';
import {
  ApplicationProvider,
  Button,
  Icon,
  IconRegistry,
  Layout,
  Text,
} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
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

const HeartIcon = (
  props?: Partial<ImageProps>,
): React.ReactElement<ImageProps> => <Icon {...props} name="heart" />;

const App = (): React.ReactFragment => {
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
              {/* <Layout style={styles.container}>
              <Text style={styles.text} category="h1">
                Welcome to UI Kitten 😻
              </Text>
              <Text style={styles.text} category="s1">
                Start with editing App.js to configure your App
              </Text>
              <Text style={styles.text} appearance="hint">
                For example, try changing theme to Dark by using eva.dark
              </Text>
              <Button
                style={styles.likeButton}
                onPress={toggleTheme}
                accessoryLeft={HeartIcon}>
                LIKE
              </Button>
            </Layout> */}
            </NavigationContainer>
          </ApplicationProvider>
        </ThemeContext.Provider>
      </Provider>
    </PersistGate>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
  likeButton: {
    marginVertical: 16,
  },
});
