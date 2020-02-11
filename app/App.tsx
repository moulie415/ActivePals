import React, { Component, FunctionComponent } from 'react';
import { Platform, AppState, SafeAreaView } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator, createMaterialTopTabNavigator, MaterialTopTabBar } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import firebase from 'react-native-firebase';
import { MaterialTabBarProps } from 'react-navigation-tabs/lib/typescript/src/types';
import color from 'color';
import Login from './views/login';
import SignUp from './views/SignUp';
import Home from './views/Home';
import Sessions from './views/sessions/Sessions';
import SessionInfo from './views/sessions/SessionInfo';
import Friends from './views/Friends';
import Profile from './views/Profile';
import ProfileView from './views/ProfileView';
import PostView from './views/PostView';
import Settings from './views/Settings';
import Messaging from './views/chat/Messaging';
import DirectMessages from './views/chat/DirectMessages';
import SessionChats from './views/chat/SessionChats';
import GymChat from './views/chat/GymChat';
import TestScreen from './views/TestScreen';
import SessionDetail from './views/sessions/SessionDetail';
import FilePreview from './views/FilePreview';
import Notifications from './views/notifications';
import Gym from './views/Gym';
import Credits from './views/Credits';
import colors from './constants/colors';
import FullScreenVideo from './views/FullScreenVideo';
import Welcome from './views/Welcome';
import Form from './views/Form';
import { UserState } from './types/Profile';
import NavigationService from './actions/navigation';
import ChatTabBarIcon from './components/ChatTabBarIcon';
import ChatTabLabel from './components/ChatTabLabel';

const SafeAreaMaterialTopTabBar: FunctionComponent<MaterialTabBarProps> = ({ ...props }) => (
  <SafeAreaView style={{ backgroundColor: colors.primary }}>
    <MaterialTopTabBar {...props} />
  </SafeAreaView>
);

const chats = createMaterialTopTabNavigator(
  {
    SessionChats: {
      screen: SessionChats,
      navigationOptions: { tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Sessions" color={tintColor} /> },
    },
    DirectMessages: {
      screen: DirectMessages,
      navigationOptions: { tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Pals" color={tintColor} /> },
    },
    GymChat: {
      screen: GymChat,
      navigationOptions: {
        tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Gym" color={tintColor} />,
      },
    },
  },
  {
    tabBarComponent: props => <SafeAreaMaterialTopTabBar {...props} />,
    tabBarPosition: 'top',
    tabBarOptions: {
      showLabel: true,
      labelStyle: {
        fontSize: 15,
        fontFamily: 'Montserrat',
      },
      activeTintColor: '#fff',
      inactiveTintColor: colors.secondary,
      style: {
        backgroundColor: colors.primary,
      },
      indicatorStyle: {
        backgroundColor: '#fff',
      },
    },
  }
);

const tabs = createBottomTabNavigator(
  {
    Home: { screen: Home },
    Sessions: { screen: Sessions },
    // PersonalTraining: { screen: PersonalTraining },
    Friends: { screen: Friends },
    Chat: { screen: chats, navigationOptions: { tabBarIcon: ({ tintColor }) => <ChatTabBarIcon color={tintColor} /> } },
    Profile: { screen: Profile },
  },
  {
    tabBarOptions: {
      activeTintColor: colors.primary,
      inactiveTintColor: color(colors.secondary)
        .lighten(0.3)
        .hex(),
      style: { backgroundColor: '#fff' },
      showIcon: true,
      labelStyle: {
        fontSize: 10,
        margin: 0,
        marginTop: Platform.OS === 'android' ? 5 : 0,
        padding: 0,
      },
      // showLabel: false,
    },
  }
);

export const Stack = createStackNavigator(
  {
    Login: { screen: Login },
    SessionDetail: { screen: SessionDetail },
    SessionInfo: { screen: SessionInfo },
    SignUp: { screen: SignUp },
    MainNav: { screen: tabs },
    Messaging: { screen: Messaging },
    Settings: { screen: Settings },
    TestScreen: { screen: TestScreen },
    FilePreview: { screen: FilePreview },
    ProfileView: { screen: ProfileView },
    PostView: { screen: PostView },
    Notifications: { screen: Notifications },
    Gym: { screen: Gym },
    Welcome: { screen: Welcome },
    Credits: { screen: Credits },
    FullScreenVideo: { screen: FullScreenVideo },
    Form: { screen: Form },
  },
  {
    headerMode: 'none',
  }
);

const Navigation = createAppContainer(Stack);

class App extends Component {
  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const user = firebase.auth().currentUser;
    if (user) {
      if (nextAppState === 'active') {
        firebase
          .database()
          .ref(`users/${user.uid}`)
          .child('state')
          .set(UserState.ONLINE);
      } else {
        firebase
          .database()
          .ref(`users/${user.uid}`)
          .child('state')
          .set(UserState.AWAY);
      }
    }
  };

  render() {
    // const { nav, dispatch } = this.props;

    return (
      <Navigation
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}

export default App;
