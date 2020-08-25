import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  Image as SlowImage,
  ActivityIndicator,
} from 'react-native';
import {PulseIndicator} from 'react-native-indicators';
import Swipeout from 'react-native-swipeout';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import styles from '../styles/notificationsStyles';

import {getSimplifiedTime, sortNotificationsByDate} from '../constants/utils';
import {
  getNotifications,
  setNotificationsRead,
  deleteNotification,
} from '../actions/home';
import NotificationsProps from '../types/views/Notifications';
import {NotificationType} from '../types/Notification';
import globalStyles from '../styles/globalStyles';
import {Icon, Text, List} from '@ui-kitten/components';

interface State {
  close: boolean;
  spinner: boolean;
  loadingMore: boolean;
  fetchAmount: number;
  showLoadMore: boolean;
}
class Notifications extends Component<NotificationsProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      close: false,
      spinner: true,
      loadingMore: false,
      fetchAmount: 10,
      showLoadMore: false,
    };
  }

  async componentDidMount() {
    const {fetchNotifications, setRead} = this.props;
    this.setState({spinner: true});
    await fetchNotifications();
    this.setState({spinner: false});
    setRead();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {fetchAmount} = this.state;
    this.setState({spinner: false});
    if (nextProps.notifications) {
      this.setState({
        showLoadMore:
          Object.values(nextProps.notifications).length === fetchAmount,
      });
    }
  }

  getTypeImage(item) {
    const {friends, users} = this.props;
    const friend = friends[item.uid] || users[item.uid];
    switch (item.type) {
      case NotificationType.COMMENT:
        return (
          <Icon
            size={25}
            name="md-chatboxes"
            style={{marginRight: 15, marginLeft: 5}}
          />
        );
      case NotificationType.FRIEND_REQUEST:
        return (
          <Icon
            size={25}
            name="md-people"
            style={{marginRight: 15, marginLeft: 5}}
          />
        );
      case NotificationType.POST_MENTION:
      case NotificationType.COMMENT_MENTION:
        if (friend) {
          if (friend.avatar) {
            return (
              <Image
                source={{uri: friend.avatar}}
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 15,
                  marginRight: 15,
                }}
              />
            );
          }
          return <Icon size={35} name="md-contact" style={{marginRight: 15}} />;
        }
        return (
          <Icon
            size={25}
            name="md-chatboxes"
            style={{marginRight: 15, marginLeft: 5}}
          />
        );
      default:
        return (
          <SlowImage
            source={require('../../assets/images/weightlifting_up.png')}
            style={{
              width: 25,
              height: 25,
              marginRight: 15,
            }}
          />
        );
    }
  }

  getNotificationString(item) {
    const {friends, users} = this.props;
    let user;
    if (friends[item.uid]) {
      user = friends[item.uid].username;
    } else if (users[item.uid]) {
      user = users[item.uid].username;
    } else {
      user = 'Unknown user';
    }
    switch (item.type) {
      case NotificationType.POST_REP:
        return `${user} repped your post`;
      case NotificationType.COMMENT_REP:
        return `${user} repped your comment`;
      case NotificationType.COMMENT:
        return `${user} commented on your post`;
      case NotificationType.FRIEND_REQUEST:
        return `${user} sent you a pal request`;
      case NotificationType.COMMENT_MENTION:
        return `${user} mentioned you in a comment`;
      case NotificationType.POST_MENTION:
        return `${user} mentioned you in a post`;
      default:
        return '';
    }
  }

  static navigationOptions = {
    headerShown: false,
  };

  render() {
    const {
      notifications,
      fetchNotifications,
      onDelete,
      navigation,
    } = this.props;
    const {fetchAmount, close, showLoadMore, loadingMore, spinner} = this.state;
    const empty = (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            textAlign: 'center',
            color: '#999',
            fontSize: 20,
            marginTop: 10,
          }}>
          No notifications yet
        </Text>
      </View>
    );

    return (
      <View style={{flex: 1}}>
        <Header hasBack title="Notifications" />
        {spinner ? (
          <View style={globalStyles.indicator}>
            <ActivityIndicator />
          </View>
        ) : (
          <List
            data={sortNotificationsByDate(Object.values(notifications))}
            renderItem={({item}) => {
              const swipeoutBtns = [
                {
                  text: 'Delete',
                  onPress: async () => {
                    await onDelete(item.key);
                    fetchNotifications(fetchAmount);
                    this.setState({close: true});
                  },
                },
              ];
              return (
                <Swipeout right={swipeoutBtns} key={item.key} close={close}>
                  <TouchableOpacity
                    onPress={() => {
                      if (item.postId) {
                        navigation.navigate('PostView', {postId: item.postId});
                      } else if (item.type === 'friendRequest') {
                        navigation.navigate('Friends');
                      }
                    }}>
                    <View style={styles.inboxItem}>
                      {this.getTypeImage(item)}
                      <View style={{flex: 8}}>
                        <Text style={{color: '#000', fontSize: 15}}>
                          {this.getNotificationString(item)}
                        </Text>
                        <Text style={{color: '#999', fontSize: 12}}>
                          {getSimplifiedTime(new Date(item.date))}
                        </Text>
                      </View>
                      <Icon
                        size={25}
                        name="ios-arrow-forward"
                        style={{
                          color: '#999',
                          textAlign: 'right',
                          marginRight: 10,
                          flex: 1,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </Swipeout>
              );
            }}
            keyExtractor={(item) => item.key}
            ListEmptyComponent={empty}
            ListFooterComponent={() => {
              if (showLoadMore) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState(
                        {loadingMore: true, fetchAmount: fetchAmount + 10},
                        async () => {
                          await fetchNotifications(fetchAmount);
                          this.setState({loadingMore: false});
                        },
                      );
                    }}
                    style={{
                      paddingVertical: loadingMore ? 0 : 10,
                    }}>
                    {loadingMore ? (
                      <ActivityIndicator style={{height: 35}} />
                    ) : (
                      <Text style={{textAlign: 'center'}}>Load More</Text>
                    )}
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        )}
      </View>
    );
  }
}

const matchStateToProps = ({profile, home, friends, sharedInfo}) => ({
  profile: profile.profile,
  notifications: home.notifications,
  friends: friends.friends,
  users: sharedInfo.users,
});

const mapDispatchToProps = (dispatch) => ({
  fetchNotifications: (limit = 10) => dispatch(getNotifications(limit)),
  setRead: () => dispatch(setNotificationsRead()),
  onDelete: (key) => dispatch(deleteNotification(key)),
});

export default connect(matchStateToProps, mapDispatchToProps)(Notifications);
