import React, {Component} from 'react';
import {View, TouchableOpacity, Image as SlowImage} from 'react-native';
import Swipeout, {SwipeoutButtonProperties} from 'react-native-swipeout';
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
import {
  Text,
  List,
  Layout,
  ListItem,
  Divider,
  Spinner,
  withStyles,
} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import {MyThunkDispatch, MyRootState} from '../types/Shared';
import RepIcon from '../components/RepIcon/RepIcon';

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
        return <ThemedIcon size={25} name="message-square" />;
      case NotificationType.FRIEND_REQUEST:
        return <ThemedIcon size={25} name="person-add" />;
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
                }}
              />
            );
          }
          return <ThemedIcon size={35} name="person" />;
        }
        return <ThemedIcon size={25} name="message-square" />;
      default:
        return <RepIcon size={25} disabled active />;
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
            marginTop: 10,
          }}>
          No notifications yet
        </Text>
      </View>
    );

    return (
      <Layout style={{flex: 1}}>
        {spinner ? (
          <View style={globalStyles.indicator}>
            <Spinner />
          </View>
        ) : (
          <List
            data={sortNotificationsByDate(Object.values(notifications))}
            ItemSeparatorComponent={Divider}
            renderItem={({item}) => {
              const swipeoutBtns: SwipeoutButtonProperties[] = [
                {
                  text: 'Delete',
                  onPress: async () => {
                    await onDelete(item.key);
                    fetchNotifications(fetchAmount);
                    this.setState({close: true});
                  },
                  backgroundColor: this.props.eva.theme['color-danger-active'],
                },
              ];
              return (
                <Swipeout right={swipeoutBtns} key={item.key} close={close}>
                  <ListItem
                    onPress={() => {
                      if (item.postId) {
                        navigation.navigate('PostView', {postId: item.postId});
                      } else if (item.type === 'friendRequest') {
                        navigation.navigate('Friends');
                      }
                    }}
                    title={this.getNotificationString(item)}
                    description={getSimplifiedTime(new Date(item.date))}
                    accessoryLeft={() => (
                      <View style={{margin: 5}}>{this.getTypeImage(item)}</View>
                    )}
                    accessoryRight={() => (
                      <ThemedIcon size={25} name="arrow-ios-forward" />
                    )}
                  />
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
                      <Spinner />
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
      </Layout>
    );
  }
}

const matchStateToProps = ({
  profile,
  home,
  friends,
  sharedInfo,
}: MyRootState) => ({
  profile: profile.profile,
  notifications: home.notifications,
  friends: friends.friends,
  users: sharedInfo.users,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  fetchNotifications: (limit = 10) => dispatch(getNotifications(limit)),
  setRead: () => dispatch(setNotificationsRead()),
  onDelete: (key) => dispatch(deleteNotification(key)),
});

export default connect(
  matchStateToProps,
  mapDispatchToProps,
)(withStyles(Notifications));
