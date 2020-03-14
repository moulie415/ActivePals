import React, { FunctionComponent } from 'react';
import { Text, TextProperties } from 'react-native';
import colors from '../constants/colors';

const AppText: FunctionComponent<TextProperties> = props => {
  const { style } = props;
  return <Text {...props} style={[{ fontFamily: 'Montserrat', color: colors.textGrey }, style]} />;
};

export default AppText;
