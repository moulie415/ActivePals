import React, {FunctionComponent} from 'react';
import VideoPlayer from 'react-native-video-controls';
import {connect} from 'react-redux';
import {StatusBar} from 'react-native';
import FullScreenVideoProps from '../types/views/FullScreenVideo';
import {Layout} from '@ui-kitten/components';

const FullScreenVideo: FunctionComponent<FullScreenVideoProps> = ({
  navigation,
  route,
}) => {
  const {uri} = route.params;
  return (
    <Layout style={{flex: 1}}>
      <StatusBar hidden />
      <VideoPlayer
        source={{uri}}
        disableVolume
        disableFullscreen
        style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}
        onBack={() => navigation.goBack()}
      />
    </Layout>
  );
};

export default connect()(FullScreenVideo);
