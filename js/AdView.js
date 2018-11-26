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
        <View style={{flexDirection: 'row', flex: 1, alignItems: 'center', marginTop: 10}}>
          <AdIconView style={{ width: 40, height: 40, marginRight: 10}} />
          <TriggerableView>
            <Text style={{color: '#000', marginRight: 10}}>{this.props.nativeAd.advertiserName}</Text>
            <Text style={{color: '#999', marginRight: 10, flexWrap: 'wrap', flex: 1}}>{'\n' + this.props.nativeAd.bodyText}</Text>
         </TriggerableView>
        

          </View>
          <MediaView style={{ width: '100%', height: 300, marginTop: 10 }} />
        </View>
      );
    }
  }
  
  export default withNativeAd(AdComponent);