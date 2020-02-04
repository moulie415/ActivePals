import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from '../Text';
import styles from './styles';

const ChatTabBarIcon: FunctionComponent = ({ unreadCount, color }) => {
  let count = 0;
  Object.values(unreadCount).forEach(val => (count += val));
  return (
    <>
      <Icon name="md-chatboxes" size={25} style={{ color }} />
      {count > 0 && (
        <View style={styles.active}>
          <Text style={styles.unreadCount}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </>
  );
};

const mapStateToProps = ({ chats }) => ({
  unreadCount: chats.unreadCount,
});

export default connect(mapStateToProps)(ChatTabBarIcon);
