import React from "react"
import {
  AdIconView,
  MediaView,
  AdChoicesView,
  TriggerableView,
  withNativeAd,
  AdSettings,
  NativeAdsManager,
} from 'react-native-fbads'
import {
    View,
} from 'react-native'
import Text from './Text'
import PropTypes from 'prop-types'
import {
  AdMobBanner
} from 'react-native-admob'
import str from '../constants/strings'
import Card from "./Card"
// AdSettings.clearTestDevices()
// AdSettings.setLogLevel('none')
// AdSettings.addTestDevice(AdSettings.currentDeviceHash)

  const fbAd = ({nativeAd}) => {
    return <View style={{padding: 10, margin: 5}}>
      <AdChoicesView/>
      <TriggerableView> 
        <Text style={{
          color: '#999',
          fontStyle: 'italic',
          marginBottom: 10,
          textAlign: 'right',
          }}>{nativeAd.sponsoredTranslation}</Text>
      </TriggerableView>
      <View style={{flexDirection: 'row', marginTop: 10}}>
        <AdIconView style={{ width: 40, height: 40, marginRight: 10, alignSelf: 'center'}} />
        <TriggerableView style={{marginRight: 10, flex: 1, flexWrap: 'wrap'}}>
          <Text numberOfLines={1} style={{color: '#000'}}>{nativeAd.advertiserName + '\n'}</Text>          
          <Text numberOfLines={2} style={{color: '#999'}}>{nativeAd.bodyText}</Text>
        </TriggerableView>

        </View>
        <MediaView style={{ width: '100%', height: 300, marginTop: 10 }} />
      </View>
  }

  fbAd.propTypes = {
    nativeAd:  PropTypes.any,
  }

  const NativeAd = withNativeAd(fbAd)

  const adsManager = new NativeAdsManager(str.nativePlacementId)
  
  const AdComponent = ({index}) => {
    if (index > 0 && index % 4 == 0) {
      if (index % 8 == 0) {
        return (
          <Card style={{marginBottom: 10}}>
            <NativeAd adsManager={adsManager}/>
          </Card>
        )
      }
      else {
        return <Card style={{padding: 10, marginBottom: 10}}>
          <AdMobBanner
          adSize="largeBanner"
          style={{alignSelf: 'center'}}
          adUnitID={str.admobBanner}
          testDevices={str.testDevices}
          onAdFailedToLoad={error => {
            console.log(error)
          }}
          />
        </Card>
      }
    }
    else return null
  }

  AdComponent.propTypes = {
    index: PropTypes.number.isRequired
  }
  
  export default AdComponent