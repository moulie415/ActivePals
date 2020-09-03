import React, {FunctionComponent} from 'react';
import {View, TouchableOpacity} from 'react-native';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import {Text, withStyles} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';
import {connect} from 'react-redux';
import NotificationsButtonProps from '../../types/components/NotificationsButtonProps';
import styles from '../../styles/homeStyles';

const NotificationsButton: FunctionComponent<NotificationsButtonProps> = ({
  navigation,
  profile: {unreadCount},
  eva,
}) => {
  return (
    <TouchableOpacity
      style={{padding: 10}}
      onPress={() => navigation.navigate('Notifications')}>
      <View style={{width: 30, alignItems: 'center'}}>
        <ThemedIcon name="bell" size={30} />
        {!!unreadCount && unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              {backgroundColor: eva.theme['color-primary-active']},
            ]}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={unreadCount > 0}
              style={{fontSize: 10, color: '#fff'}}>
              {unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  profile: profile.profile,
});

export default connect(mapStateToProps)(withStyles(NotificationsButton));
