import {createRef} from 'react';
import {NavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createRef<NavigationContainerRef>();

export const navigate = (name: string, params?: object) => {
  navigationRef.current?.navigate(name, params);
};
