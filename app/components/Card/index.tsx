import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import CardProps from '../../types/components/Card';
import styles from '../../styles/components/Card';

const Card: FunctionComponent<CardProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

export default Card;
