import React, {FunctionComponent, useState, useEffect} from 'react';
import {SafeAreaView, TouchableOpacity, Alert} from 'react-native';
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
import {Layout, Input, Text, Button} from '@ui-kitten/components';
import Logo from '../components/Logo/Logo';
import ThemedImage from '../components/ThemedImage/ThemedImage';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';

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
  const Skip = () => {
    return (
      <SafeAreaView
        style={{padding: 10, position: 'absolute', top: 5, right: 10}}>
        <TouchableOpacity onPress={() => nav()}>
          <Text>Skip</Text>
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
      nextButton={<ThemedIcon name="arrow-ios-forward" size={50} />}
      prevButton={<ThemedIcon name="arrow-ios-back" size={50} />}>
      <Layout style={styles.slide} level="1">
        <Skip />
        <Text category="h1" style={styles.text}>
          {`Welcome \n to \n ${str.appName}`}
        </Text>
        <Logo size={100} />
      </Layout>
      <Layout style={styles.slide} level="1">
        <Skip />
        <Text category="h3" style={styles.text}>
          Create and join sessions with people in your area
        </Text>
        {renderImages()}
        <Text category="h3" style={styles.text}>
          Or create private sessions for you and your pals
        </Text>
        <ThemedIcon size={50} name="lock" />
      </Layout>
      <Layout style={styles.slide} level="1">
        <Skip />
        <Text category="h3" style={styles.text}>
          Search for and join your local Gym
        </Text>
        <ThemedImage size={50} source={getResource(SessionType.GYM)} />
        <Text category="h3" style={styles.text}>
          {
            'Are you a personal trainer? \nWhy not get verified? \n(coming soon)'
          }
        </Text>
        <ThemedImage
          source={require('../../assets/images/muscle.png')}
          size={50}
        />
      </Layout>
      <Layout style={styles.slide} level="1">
        <Skip />
        <Text category="h3" style={styles.text}>
          Participate in chats with your pals, in sessions and with members of
          your gym!!
        </Text>
        <ThemedIcon name="message-square-outline" size={50} />
      </Layout>
      <Layout style={styles.slide} level="4">
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
        <Text category="h5" style={styles.text}>
          Make sure to set a username so your pals can add you
        </Text>
        <Input
          style={{marginVertical: 20}}
          value={username}
          onChangeText={(input) => setUsername(input)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
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
          Finish
        </Button>
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
