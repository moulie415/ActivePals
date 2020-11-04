import React, {FunctionComponent} from 'react';
import {connect} from 'react-redux';
import styles from './styles';
import ChatTabLabelProps from '../../types/components/ChatTabLabel';
import {MyRootState} from '../../types/Shared';
import {Text, Layout, withStyles} from '@ui-kitten/components';

const ChatTabLabel: FunctionComponent<ChatTabLabelProps> = ({
  unreadCount,
  type,
  chats,
  sessionChats,
  gymChat,
  eva,
}) => {
  let count = 0;
  const chatType = type.toLowerCase();
  Object.keys(unreadCount).forEach((key) => {
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
    <>
      {count > 0 && (
        <Layout
          style={[
            styles.active,
            {backgroundColor: eva.theme['color-primary-active']},
          ]}>
          <Text style={styles.unreadCount}>{count > 9 ? '9+' : count}</Text>
        </Layout>
      )}
    </>
  );
};

const mapStateToProps = ({chats}: MyRootState) => ({
  unreadCount: chats.unreadCount,
  chats: chats.chats,
  sessionChats: chats.sessionChats,
  gymChat: chats.gymChat,
});

export default connect(mapStateToProps)(withStyles(ChatTabLabel));
