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
import auth from '@react-native-firebase/auth';
import * as eva from '@eva-design/eva';
import {ThemeContext} from './context/themeContext';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
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
import Settings from './views/Settings';
import NotificationsButton from './components/NotificationsButton/NotificationsButton';
import notifications from './views/notifications';
import SessionInfo from './views/sessions/SessionInfo';
import Gym from './views/Gym';
import Messaging from './views/chat/Messaging';
import Session from './types/Session';
import ProfileView from './views/ProfileView';
import SessionDetail from './views/sessions/SessionDetail';
import Location from './types/Location';
import PostView from './views/PostView';
import ChatTabBarIcon from './components/ChatTabBarIcon';
import {ImageProps, AppState, AppStateStatus} from 'react-native';
import FullScreenVideo from './views/FullScreenVideo';
import Credits from './views/Credits';
import Instabug from 'instabug-reactnative';
import AddFriendButton from './components/AddFriendButton/AddFriendButton';
import FilePreview from './views/FilePreview';
import MapToggle from './components/MapToggle/MapToggle';
import FilterModalButton from './components/FilterModalButton/FilterModalButton';
import {UserState} from './types/Profile';
import {navigationRef} from './RootNavigation';

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
  ProfileView: {uid: string};
  Settings: undefined;
  Notifications: undefined;
  SessionInfo: {sessionId: string; isPrivate: boolean};
  Gym: {id: string};
  Messaging: {
    sessionId?: string;
    gymId?: string;
    chatId?: string;
    friendUsername?: string;
    friendUid?: string;
  };
  SessionDetail: {location?: Location; friends?: string[]};
  PostView: {postId: string};
  FullScreenVideo: {uri: string};
  Credits: undefined;
  FilePreview: {
    type: 'video' | 'image';
    uri: string;
    message: boolean;
    text?: string;
  };
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

const HomeIcon = (props: Partial<ImageProps> | undefined) => (
  <Icon {...props} name="home" />
);
const SessionsIcon = ({style}: Partial<ImageProps> | undefined) => {
  return (
    <ThemedImage
      size={24}
      fill={style?.tintColor}
      style={{marginVertical: style?.marginVertical}}
      source={require('../assets/images/dumbbell.png')}
    />
  );
};
const FriendsIcon = (props: Partial<ImageProps> | undefined) => (
  <Icon {...props} name="people" />
);
const ChatsIcon = (props: Partial<ImageProps> | undefined) => (
  <ChatTabBarIcon color={props?.style?.tintColor} />
);
const ProfileIcon = (props: Partial<ImageProps> | undefined) => (
  <Icon {...props} name="person" />
);

const BottomTabBar = ({navigation, state}) => (
  <BottomNavigation
    style={{paddingVertical: 8}}
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title="Home" icon={HomeIcon} />
    <BottomNavigationTab title="Sessions" icon={SessionsIcon} />
    <BottomNavigationTab title="Pals" icon={FriendsIcon} />
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

  useEffect(() => {
    Instabug.setWelcomeMessageMode(Instabug.welcomeMessageMode.disabled);
    Instabug.startWithToken('804c8f8e35fa17bdafb82e6778629dd4', [
      Instabug.invocationEvent.none,
    ]);
  }, []);

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    const user = auth().currentUser;
    if (user) {
      if (nextAppState === 'active') {
        database()
          .ref(`users/${user.uid}`)
          .child('state')
          .set(UserState.ONLINE);
      } else {
        database().ref(`users/${user.uid}`).child('state').set(UserState.AWAY);
      }
    }
  };

  return (
    <PersistGate persistor={persistor}>
      <Provider store={store}>
        <IconRegistry icons={EvaIconsPack} />
        <ThemeContext.Provider value={{theme, toggleTheme}}>
          {/* @ts-ignore */}
          <ApplicationProvider {...eva} theme={eva[theme]}>
            <NavigationContainer ref={navigationRef}>
              <Stack.Navigator
                screenOptions={({navigation, route}) => ({
                  headerStyle: {
                    backgroundColor: theme === 'light' ? '#fff' : '#222B45',
                  },
                  headerTitleStyle: {
                    color: theme === 'light' ? '#222B45' : '#fff',
                  },
                  headerBackTitleStyle: {
                    color: theme === 'light' ? '#222B45' : '#fff',
                  },
                  headerTintColor: theme === 'light' ? '#222B45' : '#fff',
                  headerTitle: route.name === 'Tabs' ? '' : undefined,

                  headerRight: () => {
                    const index = route?.state?.index;
                    if (route.name === 'Tabs') {
                      if (!route.state || index === 0) {
                        return <NotificationsButton navigation={navigation} />;
                      }
                      if (index === 1) {
                        return <MapToggle />;
                      }
                      if (index === 2) {
                        return <AddFriendButton />;
                      }
                    }
                  },
                  headerLeft: (props) => {
                    const index = route?.state?.index;
                    if (route.name === 'Tabs') {
                      if (index === 1) {
                        return <FilterModalButton />;
                      }
                    }
                    if (props.canGoBack) {
                      return <HeaderBackButton {...props} />;
                    }
                  },
                })}>
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
                <Stack.Screen name="Settings" component={Settings} />
                <Stack.Screen name="Notifications" component={notifications} />
                <Stack.Screen name="SessionInfo" component={SessionInfo} />
                <Stack.Screen name="Gym" component={Gym} />
                <Stack.Screen name="Messaging" component={Messaging} />
                <Stack.Screen name="ProfileView" component={ProfileView} />
                <Stack.Screen name="SessionDetail" component={SessionDetail} />
                <Stack.Screen name="PostView" component={PostView} />
                <Stack.Screen
                  name="FullScreenVideo"
                  component={FullScreenVideo}
                  options={() => ({headerShown: false})}
                />
                <Stack.Screen name="Credits" component={Credits} />
                <Stack.Screen name="FilePreview" component={FilePreview} />
              </Stack.Navigator>
            </NavigationContainer>
          </ApplicationProvider>
        </ThemeContext.Provider>
      </Provider>
    </PersistGate>
  );
};

export default App;
