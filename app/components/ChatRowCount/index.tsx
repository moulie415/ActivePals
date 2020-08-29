import React, {FunctionComponent} from 'react';
import {connect} from 'react-redux';
import {View} from 'react-native';
import styles from './styles';
import ChatRowCountProps from '../../types/components/ChatRowCount';
import {Text, withStyles} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';

const ChatRowCount: FunctionComponent<ChatRowCountProps> = ({
  unreadCount,
  id,
  eva,
}) => {
  console.log({unreadCount});
  const count = unreadCount[id];
  console.log({id});
  console.log({count});
  if (count && count > 0) {
    return (
      <View
        style={[
          styles.countContainer,
          {backgroundColor: eva.theme['color-primary-active']},
        ]}>
        <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
      </View>
    );
  }
  return null;
};

const mapStateToProps = ({chats}: MyRootState) => ({
  unreadCount: chats.unreadCount,
});

export default connect(mapStateToProps)(withStyles(ChatRowCount));
