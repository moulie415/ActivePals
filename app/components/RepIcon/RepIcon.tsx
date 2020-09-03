import React, {FunctionComponent} from 'react';
import Image from 'react-native-fast-image';
import {withStyles} from '@ui-kitten/components';
import RepIconProps from '../../types/components/RepIcon';
import {TouchableOpacity} from 'react-native';

const weightUp = require('../../../assets/images/weightlifting_up.png');
const weightDown = require('../../../assets/images/weightlifting_down.png');

const RepIcon: FunctionComponent<RepIconProps> = ({
  size,
  eva,
  style,
  active,
  onPress,
  disabled,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Image
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
        tintColor={
          active
            ? eva.theme['color-primary-active']
            : eva.theme['background-alternative-color-1']
        }
        source={active ? weightUp : weightDown}
      />
    </TouchableOpacity>
  );
};

export default withStyles(RepIcon);
