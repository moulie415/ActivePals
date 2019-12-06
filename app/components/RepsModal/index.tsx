import React, { FunctionComponent } from 'react';
import ModalBox from 'react-native-modalbox';
import { Platform, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const RepsModal: FunctionComponent = () => {
  return (
    <ModalBox
      style={{
        width: SCREEN_WIDTH/2,
        height: SCREEN_HEIGHT/1.5,
        marginTop: Platform.select({ ios: 10 }),
        borderRadius: 5,
        padding: 5,
      }}
    ></ModalBox>
  );
};

export default RepsModal
