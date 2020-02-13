import React, { FunctionComponent } from 'react';
import { Text, TextProperties } from 'react-native';

const AppText: FunctionComponent<TextProperties> = props => {
  const { style } = props;
  return <Text {...props} style={[{ fontFamily: 'Montserrat' }, style]} />;
};

export default AppText;
