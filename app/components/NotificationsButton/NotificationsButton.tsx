import React, {FunctionComponent} from 'react';
import {View, TouchableOpacity} from 'react-native';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import {Text} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';
import {connect} from 'react-redux';
import NotificationsButtonProps from '../../types/components/NotificationsButtonProps';
import styles from '../../styles/homeStyles';

const NotificationsButton: FunctionComponent<NotificationsButtonProps> = ({
  navigation,
  profile: {unreadCount},
}) => {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
      <View style={{width: 30, alignItems: 'center'}}>
        <ThemedIcon name="bell" size={25} style={{marginLeft: -10}} />
        {!!unreadCount && unreadCount > 0 && (
          <View style={styles.unreadBadge}>
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

export default connect(mapStateToProps)(NotificationsButton);
