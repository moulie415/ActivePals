import { AppRegistry } from 'react-native';
import App from './app/App';
import bgMessaging from './app/bgMessaging';

AppRegistry.registerComponent('Anyone', () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
