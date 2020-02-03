import React, { FunctionComponent } from 'react';
import VideoPlayer from 'react-native-video-controls';
import { connect } from 'react-redux';
import { StatusBar, View } from 'react-native';
import { navigateBack } from '../actions/navigation';
import FullScreenVideoProps from '../types/views/FullScreenVideo';

const FullScreenVideo: FunctionComponent<FullScreenVideoProps> = ({ navigation, goBack }) => {
  const { params } = navigation.state;
  const { uri } = params;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden />
      <VideoPlayer
        source={{ uri }}
        disableVolume
        disableFullscreen
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        onBack={() => goBack()}
      />
    </View>
  );
};

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
});

export default connect(null, mapDispatchToProps)(FullScreenVideo);
