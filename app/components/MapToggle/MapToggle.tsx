import React, {FunctionComponent} from 'react';
import {TouchableOpacity} from 'react-native';

import MapToggleProps from '../../types/components/MapToggle';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

const MapToggle: FunctionComponent<MapToggleProps> = ({navigation}) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Map')}
      style={{padding: 10}}>
      <ThemedIcon name="map" size={30} />
    </TouchableOpacity>
  );
};

export default MapToggle;
