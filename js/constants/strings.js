import {
    Platform
} from 'react-native'

const str = {
	googleApiKey: 'AIzaSyDIjOw0vXm7e_4JJRbwz3R787WH2xTzmBw',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    appName: 'ActivePals',
    appNameFormatted: 'A C T I V E \nP A L S',
    nativePlacementId: Platform.OS == 'ios' ? '729584164091813_729677854082444' : '729584164091813_729677580749138',
    testDevices: ['4108B2196ADDE2FE584AEA026D0FE41E'],
    mentionRegex: /^(?!.*\bRT\b)(?:.+\s)?@\w+/i,

}

export default str
