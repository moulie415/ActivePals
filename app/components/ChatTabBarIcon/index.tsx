import React, {FunctionComponent} from 'react';
import {connect} from 'react-redux';
import styles from './styles';
import ChatTabBarIconProps from '../../types/components/ChatTabBarIcon';
import {MyRootState} from '../../types/Shared';
import {Text, Layout, withStyles} from '@ui-kitten/components';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

const ChatTabBarIcon: FunctionComponent<ChatTabBarIconProps> = ({
  unreadCount,
  color,
  eva,
}) => {
  const count = Object.keys(unreadCount).reduce(
    (sum, key) => sum + (unreadCount[key] || 0),
    0,
  );
  return (
    <>
      <ThemedIcon name="message-square" size={24} fill={color} />
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
});

export default connect(mapStateToProps)(withStyles(ChatTabBarIcon));
