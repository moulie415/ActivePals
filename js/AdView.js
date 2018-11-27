import React, { Component } from "react"
import {
    AdIconView,
    MediaView,
    AdChoicesView,
    TriggerableView,
    withNativeAd
  } from 'react-native-fbads'
  import {
      View,
      Platform
  } from 'react-native'
  import Text from './constants/Text'
  class AdComponent extends Component {
    render() {
      return (
        <View style={{padding: 10, margin: 5}}>
        <AdChoicesView/>
        <TriggerableView>
          <Text style={{
            color: '#999',
            fontStyle: 'italic',
            marginBottom: 10,
            textAlign: 'right',
            }}>{this.props.nativeAd.sponsoredTranslation}</Text>
        </TriggerableView>
        <View style={{flexDirection: 'row', marginTop: 10}}>
          <AdIconView style={{ width: 40, height: 40, marginRight: 10, alignSelf: 'center'}} />
          <TriggerableView style={{marginRight: 10, flex: 1, flexWrap: 'wrap'}}>
            <Text numberOfLines={1} style={{color: '#000'}}>{this.props.nativeAd.advertiserName + '\n'}</Text>          
            <Text numberOfLines={2} style={{color: '#999'}}>{this.props.nativeAd.bodyText}</Text>
          </TriggerableView>

          </View>
          <MediaView style={{ width: '100%', height: 300, marginTop: 10 }} />
        </View>
      );
    }
  }
  
  export default withNativeAd(AdComponent);