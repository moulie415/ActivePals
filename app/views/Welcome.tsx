import React, {FunctionComponent, useState, useEffect} from 'react';
import {SafeAreaView, TouchableOpacity, Image, Alert} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import styles from '../styles/welcomeStyles';
import colors from '../constants/colors';
import str from '../constants/strings';
import {getResource, renderImages} from '../constants/utils';
import FbFriendsModal from '../components/FbFriendsModal';
import {setHasViewedWelcome, fetchProfile} from '../actions/profile';
import WelcomeProps from '../types/views/Welcome';
import {SessionType} from '../types/Session';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import {Layout, Icon, Input, Text} from '@ui-kitten/components';

const Welcome: FunctionComponent<WelcomeProps> = ({
  profile,
  viewedWelcome,
  navigation,
  onSave,
  route: {params},
}) => {
  const [fbModalOpen, setFbModalOpen] = useState(false);
  const [username, setUsername] = useState(profile.username);

  useEffect(() => {
    viewedWelcome();
  }, [viewedWelcome]);

  const nav = () => {
    params && params.goBack
      ? navigation.goBack()
      : navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Tabs'}],
          }),
        );
  };
  const skip = () => {
    return (
      <SafeAreaView
        style={{padding: 10, position: 'absolute', top: 5, right: 10}}>
        <TouchableOpacity onPress={() => nav()}>
          <Text style={{color: '#fff', fontSize: 20}}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  return (
    <Swiper
      style={styles.wrapper}
      showsButtons
      loop={false}
      activeDotColor={colors.secondary}
      nextButton={<Text style={styles.buttonText}>›</Text>}
      prevButton={<Text style={styles.buttonText}>‹</Text>}>
      <Layout style={styles.slide1}>
        {skip()}
        <Text style={styles.text}>{`Welcome \n to \n ${str.appName}`}</Text>
        <Image
          style={{tintColor: '#fff', width: 100, height: 100}}
          source={require('../../assets/images/logo.png')}
        />
      </Layout>
      <Layout style={styles.slide2}>
        {skip()}
        <Text style={styles.text}>
          Create and join sessions with people in your area
        </Text>
        {renderImages()}
        <Text style={styles.text}>
          Or create private sessions for you and your pals
        </Text>
        <Icon size={50} name="ios-lock" style={{color: '#fff'}} />
      </Layout>
      <Layout style={styles.slide2}>
        {skip()}

        <Text style={styles.text}>Search for and join your local Gym</Text>
        <Image
          style={{
            tintColor: '#fff',
            height: 50,
            width: 50,
            marginHorizontal: 10,
          }}
          source={getResource(SessionType.GYM)}
        />
        <Text style={styles.text}>
          {
            'Are you a personal trainer? \nWhy not get verified? \n(coming soon)'
          }
        </Text>
        <Image
          source={require('../../assets/images/muscle.png')}
          style={{tintColor: '#fff', height: 50, width: 50, margin: 10}}
        />
      </Layout>
      <Layout style={styles.slide2}>
        {skip()}
        <Text style={styles.text}>
          Participate in chats with your pals, in sessions and with members of
          your gym!!
        </Text>
        <Icon name="md-chatboxes" style={{color: '#fff', fontSize: 50}} />
      </Layout>
      <Layout style={styles.slide3}>
        {profile.fb_login && (
          <FbFriendsModal
            style={{zIndex: 999}}
            isOpen={fbModalOpen}
            onClosed={() => {
              setFbModalOpen(false);
              nav();
            }}
          />
        )}
        <Text style={styles.text}>
          Make sure to set a username so your pals can add you
        </Text>
        <Input
          value={username}
          onChangeText={(input) => setUsername(input)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={{
            backgroundColor: colors.secondary,
            padding: 10,
            borderRadius: 5,
          }}
          onPress={async () => {
            if (username && username === profile.username) {
              nav();
            } else if (!username) {
              Alert.alert('Sorry', 'Please set a username before continuing');
            } else if (
              username.length < 5 ||
              str.whiteSpaceRegex.test(username)
            ) {
              Alert.alert(
                'Sorry',
                'Username must be at least 5 characters long and cannot contain any spaces',
              );
            } else {
              await database()
                .ref(`users/${profile.uid}`)
                .child('username')
                .set(username);
              await database()
                .ref('usernames')
                .child(username)
                .set(profile.uid);
              /* we need to make sure the username is saved locally
                    which is why this calls fetchProfile which saves the username */
              try {
                onSave();
                if (profile.fb_login) {
                  Alert.alert(
                    'Success',
                    'Username saved, do you want to find Facebook friends who are already using the app? You can do this later in the Settings screen',
                    [
                      {
                        text: 'No thanks',
                        onPress: () => nav(),
                      },
                      {
                        text: 'OK',
                        onPress: () => setFbModalOpen(true),
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  nav();
                  Alert.alert('Success', 'Username saved');
                }
              } catch (e) {
                Alert.alert(
                  'Error',
                  'That username may have already been taken',
                );
              }
            }
          }}>
          <Text>Finish</Text>
        </TouchableOpacity>
      </Layout>
    </Swiper>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  viewedWelcome: () => dispatch(setHasViewedWelcome()),
  onSave: () => dispatch(fetchProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
