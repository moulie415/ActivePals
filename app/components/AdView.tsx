import React, { FunctionComponent } from 'react';
import Instabug from 'instabug-reactnative';
import {
  AdIconView,
  MediaView,
  AdChoicesView,
  TriggerableView,
  withNativeAd,
  AdSettings,
  NativeAdsManager,
  NativeAd,
} from 'react-native-fbads';
import { View } from 'react-native';
import firebase from 'react-native-firebase';
import Text from './Text';
import str from '../constants/strings';
import Card from './Card';
// AdSettings.clearTestDevices()
// AdSettings.setLogLevel('none')
// AdSettings.addTestDevice(AdSettings.currentDeviceHash)
// const adsManager = new NativeAdsManager(str.nativePlacementId);

const fbAd: FunctionComponent<{ nativeAd: NativeAd }> = ({ nativeAd }) => {
  return (
    <View style={{ padding: 10, margin: 5 }}>
      <AdChoicesView />
      <TriggerableView>
        <Text
          style={{
            color: '#999',
            fontStyle: 'italic',
            marginBottom: 10,
            textAlign: 'right',
          }}
        >
          {nativeAd.sponsoredTranslation}
        </Text>
      </TriggerableView>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <AdIconView style={{ width: 40, height: 40, marginRight: 10, alignSelf: 'center' }} />
        <TriggerableView style={{ marginRight: 10, flex: 1, flexWrap: 'wrap' }}>
          <Text numberOfLines={1} style={{ color: '#000' }}>
            {`${nativeAd.advertiserName}\n`}
          </Text>
          <Text numberOfLines={2} style={{ color: '#999' }}>
            {nativeAd.bodyText}
          </Text>
        </TriggerableView>
      </View>
      <MediaView style={{ width: '100%', height: 300, marginTop: 10 }} />
    </View>
  );
};

// TODO: add fb ads back in
// const FbAd = withNativeAd(fbAd);

const AdComponent: FunctionComponent<{ index: number }> = ({ index }) => {
  if (index > 0 && index % 4 === 0) {
    // @ts-ignore
    const { Banner } = firebase.admob;
    // @ts-ignore
    const { AdRequest } = firebase.admob;
    const request = new AdRequest();
    return (
      <Card style={{ padding: 10, marginBottom: 10, alignItems: 'center' }}>
        <Banner
          size="LARGE_BANNER"
          request={request.build()}
          onAdLoaded={() => {
            console.log('Advert loaded');
          }}
          onAdFailedToLoad={e => {
            firebase.crashlytics().recordError(e.code, e.message);
            Instabug.logError(e.message);
          }}
          unitId={str.admobBanner}
        />
      </Card>
    );
  } else return null;
};

export default AdComponent;
