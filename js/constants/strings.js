import {
    Platform
} from 'react-native'
import Config from 'react-native-config'

const str = {
	googleApiKey: Config.GOOGLE_API_KEY,
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    appName: 'ActivePals',
    appNameFormatted: 'A C T I V E \nP A L S',
    nativePlacementId: Platform.OS == 'ios' ? '729584164091813_729677854082444' : '729584164091813_729677580749138',
    testDevices: ['4108B2196ADDE2FE584AEA026D0FE41E', '4C574D0CCA89BFCA10B89A2D9103E9CC'],
    admobBanner: Platform.OS == 'ios' ? "ca-app-pub-7885763333661292/3772507757" : "ca-app-pub-7885763333661292/5551535421", 
    mentionRegex: /^(?!.*\bRT\b)(?:.+\s)?@\w+/i,
    spinner: 'PulseIndicator',
    notifSound: 'notif.wav'
}

export default str
