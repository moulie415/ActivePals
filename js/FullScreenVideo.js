import React, { Component } from "react"
import VideoPlayer from 'react-native-video-controls'


class FullScreenVideo extends Component {
    
      constructor(props) {
          super(props)
          this.params = this.props.navigation.state.params
          this.uri = this.params.uri
      }

      render() {
        return <VideoPlayer
        source={{uri: this.uri}}
        disableVolume={true}
        disableFullscreen={true}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        onBack={()=> this.props.goBack()}
    />
      }
}

import { navigateBack } from "./actions/navigation"
import { connect } from 'react-redux'

const mapDispatchToProps = dispatch => ({
    goBack: () => dispatch(navigateBack())
})

export default connect(null, mapDispatchToProps)(FullScreenVideo)