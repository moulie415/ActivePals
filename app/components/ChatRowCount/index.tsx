import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import Text from '../Text';
import styles from './styles';
import ChatRowCountProps from '../../types/components/ChatRowCount';

const ChatRowCount: FunctionComponent<ChatRowCountProps> = ({ unreadCount, id }) => {
  const count = unreadCount[id];
  if (count && count > 0) {
    return (
      <View style={styles.countContainer}>
        <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
      </View>
    );
  }
  return null;
};

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount,
});

export default connect(mapStateToProps)(ChatRowCount);
