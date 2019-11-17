import {
    Platform
} from 'react-native'

const str = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    appName: 'ActivePals',
    appNameFormatted: 'A C T I V E \nP A L S',
    nativePlacementId: Platform.select({ios: '729584164091813_729677854082444', android: '729584164091813_729677580749138'}),
    interstitialPlacementId: Platform.select({ios: '729584164091813_959159894467571', android: '729584164091813_959185827798311'}),
    testDevices: ['4108B2196ADDE2FE584AEA026D0FE41E', '4C574D0CCA89BFCA10B89A2D9103E9CC'],
    admobBanner: Platform.select({ios: "ca-app-pub-7885763333661292/3772507757", android: "ca-app-pub-7885763333661292/5551535421"}),
    admobInterstitial: Platform.select({ios: 'ca-app-pub-7885763333661292/4553340952', android: 'ca-app-pub-7885763333661292/7008963965'}),
    mentionRegex: /\B\@([\w\-]+)/gim,
    spinner: 'PulseIndicator',
    notifSound: 'notif.wav'
}

export default str