import { AppRegistry } from 'react-native';
import App from './app/App';
import bgMessaging from './app/bgMessaging';

AppRegistry.registerComponent('ActivePals', () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging);
