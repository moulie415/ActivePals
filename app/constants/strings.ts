import {Platform} from 'react-native';
import {GOOGLE_API_KEY_ANDROID, GOOGLE_API_KEY_IOS} from 'react-native-dotenv';

export const GOOGLE_API_KEY =
  Platform.OS === 'ios' ? GOOGLE_API_KEY_IOS : GOOGLE_API_KEY_ANDROID;

//Alert.alert(GOOGLE_API_KEY_ANDROID)

const str = {
  months: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  appName: 'ActivePals',
  appNameFormatted: 'A C T I V E \nP A L S',
  admobAppId: __DEV__
    ? 'ca-app-pub-3940256099942544~3347511713'
    : Platform.OS === 'ios'
    ? 'ca-app-pub-7885763333661292~1337916108'
    : 'ca-app-pub-7885763333661292~3960210018',
  nativePlacementId:
    Platform.OS === 'ios'
      ? '729584164091813_729677854082444'
      : '729584164091813_729677580749138',
  interstitialPlacementId:
    Platform.OS === 'ios'
      ? '729584164091813_959159894467571'
      : '729584164091813_959185827798311',
  admobBanner:
    Platform.OS === 'ios'
      ? 'ca-app-pub-7885763333661292/3772507757'
      : 'ca-app-pub-7885763333661292/5551535421',

  admobInterstitial:
    Platform.OS === 'ios'
      ? 'ca-app-pub-7885763333661292/4553340952'
      : 'ca-app-pub-7885763333661292/7008963965',

  mentionRegex: /\B\@([\w\-]+)/gim,
  whiteSpaceRegex: /\s/,
  spinner: 'PulseIndicator',
  notifSound: 'notif.wav',
  keywords: [
    'gym',
    'fitness',
    'sports',
    'running',
    'active',
    'health',
    'cycling',
  ],
};

export default str;
