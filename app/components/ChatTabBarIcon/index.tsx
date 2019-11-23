import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import Text from '../Text';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const ChatTabBarIcon: FunctionComponent = ({ unreadCount, color }) => {
  let count = 0;
  Object.values(unreadCount).forEach(val => (count += val));
  return (
    <View>
      <Icon name="md-chatboxes" size={25} style={{ color }} />
      {count > 0 && (
        <View style={styles.active}>
          <Text style={styles.unreadCount}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
};

import { connect } from 'react-redux';

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount,
});

export default connect(mapStateToProps)(ChatTabBarIcon);
