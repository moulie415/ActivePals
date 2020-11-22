import React, {FunctionComponent} from 'react';
import {View, ScrollView} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import {getType} from '../constants/utils';
import {Text, Layout} from '@ui-kitten/components';
import {SessionType} from '../types/Session';
import ThemedImage from '../components/ThemedImage/ThemedImage';
import {Source} from 'react-native-fast-image';

// football icon made by Christopher Schreiner @infanf http://twitter.com/infanf

const renderImage = (require: Source, size: number, margin: number) => {
  return <ThemedImage size={size} style={{margin}} source={require} />;
};

const Credits: FunctionComponent = () => {
  return (
    <Layout style={{flex: 1}}>
      <ScrollView>
        <Hyperlink
          linkDefault
          linkText={(url) => {
            switch (url) {
              case 'http://twitter.com/Templarian':
                return '@Templarian';
              case 'http://twitter.com/Google':
                return '@Google';
              case 'http://okodesign.ru/':
                return 'okodesign.ru';
              case 'http://www.freepik.com/':
                return 'www.freepik.com';
              case 'https://www.flaticon.com/authors/monkik':
                return 'www.flaticon.com/authors/monkik';
              case 'https://www.zapsplat.com':
                return 'zapsplat.com';
              default: {
                return url;
              }
            }
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 30,
              fontWeight: 'bold',
              marginTop: 20,
            }}>
            Icon designers
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
            }}>
            {getType(SessionType.GYM, 30)}
            {getType(SessionType.RUNNING, 30)}
            {getType(SessionType.CUSTOM, 30)}
          </View>
          <Text
            style={{
              textAlign: 'center',
              marginHorizontal: 20,
              marginBottom: 10,
            }}>
            Icons made by Austin Andrews http://twitter.com/Templarian
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            {renderImage(
              require('../../assets/images/weightlifting_up.png'),
              30,
              5,
            )}
            {renderImage(
              require('../../assets/images/weightlifting_down.png'),
              30,
              5,
            )}
          </View>
          <Text
            style={{
              textAlign: 'center',
              marginHorizontal: 20,
              marginBottom: 10,
            }}>
            {'Icons made by Elias Bikbulatov from \nhttp://okodesign.ru/'}
          </Text>
          <View style={{alignItems: 'center'}}>
            {getType(SessionType.CYCLING, 30)}
            <Text
              style={{
                textAlign: 'center',
                marginHorizontal: 20,
                marginBottom: 10,
              }}>
              Icon made by http://twitter.com/Google
            </Text>
          </View>
          <View style={{alignItems: 'center'}}>
            {renderImage(require('../../assets/images/muscle.png'), 30, 5)}
            <Text
              style={{
                textAlign: 'center',
                marginHorizontal: 20,
                marginBottom: 10,
              }}>
              {'Icon made by Freepik from \nhttp://www.freepik.com/'}
            </Text>
          </View>
          <View style={{alignItems: 'center'}}>
            {renderImage(require('../../assets/images/logo.png'), 30, 5)}
            <Text
              style={{
                textAlign: 'center',
                marginHorizontal: 20,
                marginBottom: 10,
              }}>
              {
                'Icon made by monkik from \nhttps://www.flaticon.com/authors/monkik'
              }
            </Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <Text
              style={{
                textAlign: 'center',
                marginHorizontal: 20,
                marginBottom: 10,
              }}>
              {'Sound effects obtained from \nhttps://www.zapsplat.com'}
            </Text>
          </View>
        </Hyperlink>
      </ScrollView>
    </Layout>
  );
1};

export default Credits;
