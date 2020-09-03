import React, {FunctionComponent} from 'react';
import Image from 'react-native-fast-image';
import LogoProps from '../../types/components/Logo';
import {withStyles} from '@ui-kitten/components';

const Logo: FunctionComponent<LogoProps> = ({size, eva}) => {
  return (
    <Image
      style={{
        width: size,
        height: size,
      }}
      tintColor={eva.theme['background-alternative-color-1']}
      source={require('../../../assets/images/logo.png')}
    />
  );
};

export default withStyles(Logo);
