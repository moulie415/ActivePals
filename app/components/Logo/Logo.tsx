import React, {FunctionComponent} from 'react';
import Image from 'react-native-fast-image';
import LogoProps from '../../types/components/Logo';

const Logo: FunctionComponent<LogoProps> = ({size}) => {
  return (
    <Image
      style={{width: size, height: size}}
      source={require('../../../assets/images/logo.png')}
    />
  );
};

export default Logo;
