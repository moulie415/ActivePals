
import { persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createFilter } from 'redux-persist-transform-filter'
import nav from './navigation'
import friends from './friends'
import profile from './profile'
import chats from './chats'
import home from './home'
import sessions from './sessions'
import sharedInfo from './sharedInfo'
 
const config = {
    key: 'root',
    storage,
    //whitelist: ['profile'],
    // transforms: [
    //     createFilter('login', ['hasViewedWelcomeWizard']),
    //     createFilter('settings', ['unreadCount', 'profile', 'loggedOut']),
    // ],
}

// Combine all the reducers
export default persistCombineReducers(config, {
    nav,
    profile,
    friends,
    chats,
    home,
    sessions,
    sharedInfo,

})

