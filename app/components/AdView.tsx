import React, {FunctionComponent} from 'react';
import Instabug from 'instabug-reactnative';
// import {
//   AdIconView,
//   MediaView,
//   AdChoicesView,
//   TriggerableView,
//   withNativeAd,
//   AdSettings,
//   NativeAdsManager,
//   NativeAd,
// } from 'react-native-fbads';
import {View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from '@react-native-firebase/admob';
import crashlytics from '@react-native-firebase/crashlytics';
import str from '../constants/strings';
import {Text, Card, Layout} from '@ui-kitten/components';

const adUnitId = __DEV__ ? TestIds.BANNER : str.admobBanner;

// AdSettings.clearTestDevices()
// AdSettings.setLogLevel('none')
// AdSettings.addTestDevice(AdSettings.currentDeviceHash)
// const adsManager = new NativeAdsManager(str.nativePlacementId);

const fbAd: FunctionComponent<{nativeAd: NativeAd}> = ({nativeAd}) => {
  return (
    <View style={{padding: 10, margin: 5}}>
      <AdChoicesView />
      <TriggerableView>
        <Text
          style={{
            color: '#999',
            fontStyle: 'italic',
            marginBottom: 10,
            textAlign: 'right',
          }}>
          {nativeAd.sponsoredTranslation}
        </Text>
      </TriggerableView>
      <View style={{flexDirection: 'row', marginTop: 10}}>
        <AdIconView
          style={{width: 40, height: 40, marginRight: 10, alignSelf: 'center'}}
        />
        <TriggerableView style={{marginRight: 10, flex: 1, flexWrap: 'wrap'}}>
          <Text numberOfLines={1} style={{color: '#000'}}>
            {`${nativeAd.advertiserName}\n`}
          </Text>
          <Text numberOfLines={2} style={{color: '#999'}}>
            {nativeAd.bodyText}
          </Text>
        </TriggerableView>
      </View>
      <MediaView style={{width: '100%', height: 300, marginTop: 10}} />
    </View>
  );
};

// TODO: add fb ads back in
// const FbAd = withNativeAd(fbAd);

const AdComponent: FunctionComponent<{index: number}> = ({index}) => {
  if (index > 0 && index % 4 === 0) {
    return (
      <Layout style={{marginBottom: 10}}>
        <BannerAd
          size={BannerAdSize.FULL_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
            keywords: str.keywords,
          }}
          unitId={adUnitId}
        />
      </Layout>
    );
  } else {
    return null;
  }
};

export default AdComponent;
