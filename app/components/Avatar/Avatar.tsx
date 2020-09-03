import React, {FunctionComponent} from 'react';
import Image from 'react-native-fast-image';
import AvatarProps from '../../types/components/Avatar';

const Avatar: FunctionComponent<AvatarProps> = ({uri, size}) => {
  return (
    <Image
      source={{uri}}
      style={{width: size, height: size, borderRadius: size / 2}}
    />
  );
};

export default Avatar;
