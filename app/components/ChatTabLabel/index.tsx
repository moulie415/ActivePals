import React, { FunctionComponent } from 'react';
import { View, Platform } from 'react-native';
import { connect } from 'react-redux';
import Text from '../Text';
import styles from './styles';

const ChatTabLabel: FunctionComponent = ({ unreadCount, color, type, chats, sessionChats, gymChat }) => {
  let count = 0;
  const chatType = type.toLowerCase();
  Object.keys(unreadCount).forEach(key => {
    switch (chatType) {
      case 'pals':
        if (chats[key]) {
          count += unreadCount[key];
        }
        break;
      case 'sessions':
        if (sessionChats[key]) {
          count += unreadCount[key];
        }
        break;
      case 'gym':
        if (gymChat.key && gymChat.key === key) {
          count += unreadCount[key];
        }
    }
  });

  return (
    <View style={styles.container}>
      <Text style={{ color }}>{Platform.select({ ios: type, android: type.toUpperCase() })}</Text>
      {count > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
};

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount,
  chats: chats.chats,
  sessionChats: chats.sessionChats,
  gymChat: chats.gymChat,
});

export default connect(mapStateToProps)(ChatTabLabel);
