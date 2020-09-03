import React, {FunctionComponent} from 'react';
import {Alert} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import database from '@react-native-firebase/database';
import {connect} from 'react-redux';
import str from '../../constants/strings';
import ParsedTextProps from '../../types/components/ParsedText';
import {MyRootState} from '../../types/Shared';

const CustomParsedText: FunctionComponent<ParsedTextProps> = ({
  text,
  friends,
  users,
  profile,
  navigation,
  disableOnPress,
  color,
}) => {
  return (
    <ParsedText
      style={{color: color}}
      parse={[
        {
          pattern: str.mentionRegex,

          onPress: async (mention) => {
            if (!disableOnPress) {
              const name = mention.substring(1);
              const combined = [
                ...Object.values(friends),
                ...Object.values(users),
              ];
              if (name === profile.username) {
                navigation.navigate('Profile');
              } else {
                const found = combined.find(
                  (friend) => friend.username === name,
                );
                if (found) {
                  navigation.navigate('ProfileView', {uid: found.uid});
                } else {
                  try {
                    const snapshot = await database()
                      .ref('usernames')
                      .child(name)
                      .once('value');
                    if (snapshot.val()) {
                      navigation.navigate('ProfileView', {uid: snapshot.val()});
                    } else {
                      Alert.alert(
                        'Sorry',
                        'A user with that username could not be found',
                      );
                    }
                  } catch (e) {
                    console.warn(e.message);
                  }
                }
              }
            }
          },
        },
      ]}>
      {text}
    </ParsedText>
  );
};

const mapStateToProps = ({profile, friends, sharedInfo}: MyRootState) => ({
  profile: profile.profile,
  friends: friends.friends,
  users: sharedInfo.users,
});

export default connect(mapStateToProps)(CustomParsedText);
