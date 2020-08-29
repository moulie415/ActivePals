/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './app/App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {shouldNavigate, navigateFromNotif} from './app/helpers/navigation';

// Register background handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (shouldNavigate(remoteMessage.data)) {
    navigateFromNotif(remoteMessage.data);
  }
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
