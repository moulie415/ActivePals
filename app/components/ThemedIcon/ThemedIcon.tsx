import React, {FunctionComponent} from 'react';
import {withStyles, Icon} from '@ui-kitten/components';
import ThemedIconProps from '../../types/components/ThemedIcon';

const ThemedIcon: FunctionComponent<ThemedIconProps> = ({
  size,
  eva,
  name,
  style,
}) => {
  return (
    <Icon
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      fill={eva.theme['background-alternative-color-1']}
      name={name}
    />
  );
};

export default withStyles(ThemedIcon);
