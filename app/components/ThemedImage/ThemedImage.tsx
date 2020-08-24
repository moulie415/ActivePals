import React, {FunctionComponent} from 'react';
import Image from 'react-native-fast-image';
import {withStyles} from '@ui-kitten/components';
import ThemedImageProps from '../../types/components/ThemedImage';

const ThemedImage: FunctionComponent<ThemedImageProps> = ({
  size,
  eva,
  source,
  style,
}) => {
  return (
    <Image
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      tintColor={eva.theme['background-alternative-color-1']}
      source={source}
    />
  );
};

export default withStyles(ThemedImage);
