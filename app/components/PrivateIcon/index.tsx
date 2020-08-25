import React, {FunctionComponent} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import PrivateIconProps from '../../types/components/PrivateIcon';
import {Icon} from '@ui-kitten/components';

const PrivateIcon: FunctionComponent<PrivateIconProps> = ({
  size,
  color,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        Alert.alert(
          'Private session',
          'Only invited users can view this session',
        );
      }}>
      <Icon
        name="lock"
        size={size || 30}
        style={[{paddingHorizontal: 5}, style]}
      />
    </TouchableOpacity>
  );
};

export default PrivateIcon;
