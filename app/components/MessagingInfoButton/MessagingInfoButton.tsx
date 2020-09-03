import React, {FunctionComponent} from 'react';
import {TouchableOpacity} from 'react-native';
import MessagingInfoButtonProps from '../../types/components/MessagingInfoButton';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import {MyRootState} from '../../types/Shared';
import {connect} from 'react-redux';

const MessagingInfoButton: FunctionComponent<MessagingInfoButtonProps> = ({
  navigation,
  route,
  tintColor,
  sessions,
}) => {
  const {gymId, sessionId} = route.params;
  if (gymId) {
    return (
      <TouchableOpacity
        style={{padding: 10}}
        onPress={() => navigation.navigate('Gym', {id: gymId})}>
        <ThemedIcon fill={tintColor} size={25} name="info" />
      </TouchableOpacity>
    );
  }
  if (sessionId && sessions) {
    const session = sessions[sessionId];
    if (session) {
      const {key, private: isPrivate} = session;
      if (key && isPrivate) {
        return (
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() =>
              navigation.navigate('SessionInfo', {sessionId: key, isPrivate})
            }>
            <ThemedIcon fill={tintColor} size={25} name="info" />
          </TouchableOpacity>
        );
      }
    }
  }
  return null;
};

const mapStateToProps = ({sessions}: MyRootState) => ({
  sessions: {...sessions.sessions, ...sessions.privateSessions},
});

export default connect(mapStateToProps)(MessagingInfoButton);
