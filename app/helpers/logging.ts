import analytics from '@react-native-firebase/analytics';

export const logEvent = (
  event: string,
  params?: {[key: string]: string | number},
) => {
  analytics().logEvent(event, params);
};
