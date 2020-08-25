import React, {useState, useEffect} from 'react';
import {
  ApplicationProvider,
  IconRegistry,
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  TabBar,
  Tab,
} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import database from '@react-native-firebase/database';
import * as eva from '@eva-design/eva';
import {ThemeContext} from './context/themeContext';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
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
import Sessions from './views/sessions/Sessions';
import Friends from './views/Friends';
import SessionChats from './views/chat/SessionChats';
import DirectMessages from './views/chat/DirectMessages';
import GymChat from './views/chat/GymChat';
import Profile from './views/Profile';
import ThemedImage from './components/ThemedImage/ThemedImage';

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
  Sessions: undefined;
  Friends: undefined;
  Chats: undefined;
  DirectMessages: undefined;
  SessionChats: undefined;
  GymChat: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<StackParamList>();
const TabNav = createBottomTabNavigator<StackParamList>();
const TopTab = createMaterialTopTabNavigator<StackParamList>();

const TopTabBar = ({navigation, state}) => (
  <TabBar
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}>
    <Tab title="Sessions" />
    <Tab title="Pals" />
    <Tab title="Gym" />
  </TabBar>
);

const Chats = () => (
  <TopTab.Navigator tabBar={(props) => <TopTabBar {...props} />}>
    <TopTab.Screen name="SessionChats" component={SessionChats} />
    <TopTab.Screen name="DirectMessages" component={DirectMessages} />
    <TopTab.Screen name="GymChat" component={GymChat} />
  </TopTab.Navigator>
);

const HomeIcon = (props) => <Icon {...props} name="home" />;
const SessionsIcon = ({style}) => {
  return (
    <ThemedImage
      size={24}
      fill={style.tintColor}
      style={{marginVertical: style.marginVertical}}
      source={require('../assets/images/dumbbell.png')}
    />
  );
};
const FriendsIcon = (props) => <Icon {...props} name="people" />;
const ChatsIcon = (props) => <Icon {...props} name="message-square" />;
const ProfileIcon = (props) => <Icon {...props} name="person" />;

const BottomTabBar = ({navigation, state}) => (
  <BottomNavigation
    style={{marginVertical: 8}}
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title="Home" icon={HomeIcon} />
    <BottomNavigationTab title="Sessions" icon={SessionsIcon} />
    <BottomNavigationTab title="Friends" icon={FriendsIcon} />
    <BottomNavigationTab title="Chats" icon={ChatsIcon} />
    <BottomNavigationTab title="Profile" icon={ProfileIcon} />
  </BottomNavigation>
);

const Tabs = () => {
  return (
    <TabNav.Navigator tabBar={(props) => <BottomTabBar {...props} />}>
      <TabNav.Screen name="Home" component={Home} />
      <TabNav.Screen name="Sessions" component={Sessions} />
      <TabNav.Screen name="Friends" component={Friends} />
      <TabNav.Screen name="Chats" component={Chats} />
      <TabNav.Screen name="Profile" component={Profile} />
    </TabNav.Navigator>
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
