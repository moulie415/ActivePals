import React, { Component } from 'react';
import { View, ScrollView, Alert, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Image as SlowImage } from 'react-native';
import Text, { globalTextStyle } from '../components/Text';
import Image from 'react-native-fast-image';
import styles from '../styles/notificationsStyles';
import Swipeout from 'react-native-swipeout';
import colors from '../constants/colors';
import { getSimplifiedTime } from '../constants/utils';
import Header from '../components/Header/header';
const weightUp = require('Anyone/assets/images/weightlifting_up.png');
import { PulseIndicator } from 'react-native-indicators';

class Notifications extends Component {
  static navigationOptions = {
    header: null,
  };

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

  componentDidMount() {
    this.props.fetchNotifications();
    this.props.setRead();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ spinner: false });
    if (nextProps.notifications) {
      this.setState({ showLoadMore: Object.values(nextProps.notifications).length == this.state.fetchAmount });
    }
  }

  sortByDate(array) {
    return array.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  render() {
    return (
      <View style={{ backgroundColor: '#9993' }}>
        <Header hasBack={true} title={'Notifications'} />
        {Object.keys(this.props.notifications).length > 0 ? (
          <ScrollView>{this.renderNotifications()}</ScrollView>
        ) : this.state.spinner ? (
          <View style={styles.indicator}>
            <PulseIndicator color={colors.secondary} />
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', color: '#999', fontSize: 20 }}>No notifications yet</Text>
          </View>
        )}
      </View>
    );
  }

  renderNotifications() {
    return (
      <FlatList
        ref={ref => (this.flatList = ref)}
        data={this.sortByDate(Object.values(this.props.notifications))}
        renderItem={({ item }) => {
          let swipeoutBtns = [
            {
              text: 'Delete',
              backgroundColor: 'red',
              onPress: () => {
                this.props
                  .delete(item.key)
                  .then(() => this.props.fetchNotifications(this.state.fetchAmount))
                  .catch(e => Alert.alert('Error', e.message));
                this.setState({ close: true });
              },
            },
          ];
          return (
            <Swipeout right={swipeoutBtns} key={item.key} close={this.state.close}>
              <TouchableOpacity
                onPress={() => {
                  if (item.postId) {
                    this.props.viewPost(item.postId);
                  } else if (item.type == 'friendRequest') {
                    this.props.goToFriends();
                  }
                }}
              >
                <View style={styles.inboxItem}>
                  {this.getTypeImage(item)}
                  <View style={{ flex: 8 }}>
                    <Text style={{ color: '#000', fontSize: 15 }}>{this.getNotificationString(item)}</Text>
                    <Text style={{ color: '#999', fontSize: 12 }}>{getSimplifiedTime(new Date(item.date))}</Text>
                  </View>
                  <Icon
                    size={25}
                    name="ios-arrow-forward"
                    style={{ color: '#999', textAlign: 'right', marginRight: 10, flex: 1 }}
                  />
                </View>
              </TouchableOpacity>
            </Swipeout>
          );
        }}
        keyExtractor={item => item.key}
        ListFooterComponent={() => {
          if (this.state.showLoadMore) {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.setState({ loadingMore: true, fetchAmount: this.state.fetchAmount + 10 }, () => {
                    this.props.fetchNotifications(this.state.fetchAmount).then(() => {
                      this.setState({ loadingMore: false });
                    });
                  });
                }}
                style={{ backgroundColor: '#fff', paddingVertical: this.state.loadingMore ? 0 : 10 }}
              >
                {this.state.loadingMore ? (
                  <PulseIndicator color={colors.secondary} style={{ height: 35 }} />
                ) : (
                  <Text style={{ color: colors.secondary, textAlign: 'center' }}>Load More</Text>
                )}
              </TouchableOpacity>
            );
          } else return null;
        }}
      />
    );
  }

  getNotificationString(item) {
    let user;
    if (this.props.friends[item.uid]) {
      user = this.props.friends[item.uid].username;
    } else if (this.props.users[item.uid]) {
      user = this.props.users[item.uid].username;
    } else {
      user = 'Unknown user';
    }
    switch (item.type) {
      case 'postRep':
        return user + ' repped your post';
      case 'commentRep':
        return user + ' repped your comment';
      case 'comment':
        return user + ' commented on your post';
      case 'friendRequest':
        return user + ' sent you a pal request';
      case 'commentMention':
        return user + ' mentioned you in a comment';
      case 'postMention':
        return user + ' mentioned you in a post';
    }
  }

  getTypeImage(item) {
    let friend = this.props.friends[item.uid] || this.props.users[item.uid];
    switch (item.type) {
      case 'comment':
        return (
          <Icon size={25} name={'md-chatboxes'} style={{ color: colors.secondary, marginRight: 15, marginLeft: 5 }} />
        );
      case 'friendRequest':
        return (
          <Icon size={25} name={'md-people'} style={{ color: colors.secondary, marginRight: 15, marginLeft: 5 }} />
        );
      case 'postMention':
      case 'commentMention':
        if (friend) {
          if (friend.avatar) {
            return (
              <Image
                source={{ uri: friend.avatar }}
                style={{ height: 30, width: 30, borderRadius: 15, marginRight: 15 }}
              />
            );
          } else {
            return <Icon size={35} name="md-contact" style={{ color: colors.primary, marginRight: 15 }} />;
          }
        } else
          return (
            <Icon size={25} name={'md-chatboxes'} style={{ color: colors.secondary, marginRight: 15, marginLeft: 5 }} />
          );
      default:
        return (
          <SlowImage
            source={weightUp}
            style={{ width: 25, height: 25, marginRight: 15, tintColor: colors.secondary }}
          />
        );
    }
  }
}

import { connect } from 'react-redux';
import { navigateBack, navigatePostView } from '../actions/navigation';
import { getNotifications, setNotificationsRead, deleteNotification } from '../actions/home';
import { navigateFriends } from '../actions/navigation';
import firebase from 'react-native-firebase';

const matchStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  notifications: home.notifications,
  friends: friends.friends,
  users: sharedInfo.users,
  feed: home.feed,
});

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  fetchNotifications: (limit = 10) => dispatch(getNotifications(limit)),
  viewPost: post => dispatch(navigatePostView(post)),
  setRead: () => dispatch(setNotificationsRead()),
  goToFriends: () => dispatch(navigateFriends()),
  delete: key => dispatch(deleteNotification(key)),
});

export default connect(matchStateToProps, mapDispatchToProps)(Notifications);
