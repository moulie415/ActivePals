import firebase from 'react-native-firebase';

export const logEvent = (event: string, params?: { [key: string]: string | number }) => {
  firebase.analytics().logEvent(event, params);
}