import React, { Component } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Text from '../../components/Text';
import { getType, getSimplifiedTime } from '../../constants/utils';
import colors from '../../constants/colors';
import ChatTabBarIcon from '../../components/ChatTabBarIcon';
import ChatTabLabel from '../../components/ChatTabLabel';
import ChatRowCount from '../../components/ChatRowCount';
import Image from 'react-native-fast-image';
import styles from '../../styles/chatStyles';
import { SessionType } from '../../types/Session';

class GymChat extends Component<GymChatProps, { refreshing: boolean }> {
  static navigationOptions = {
    header: null,
    tabBarLabel: ({ tintColor }) => <ChatTabLabel type="Gym" color={tintColor} />,
    tabBarIcon: ({ tintColor }) => <ChatTabBarIcon color={tintColor} />,
  };

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  render() {
    const gym = this.props.gym;
    const gymChat = this.props.gymChat;
    return (
      <>
        {this.props.gym ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => {
                  this.setState({ refreshing: true });
                  this.props.getChat(gym.place_id).then(() => {
                    this.setState({ refreshing: false });
                  });
                }}
              />
            }
            style={{ backgroundColor: '#9993' }}
          >
            <TouchableOpacity
              onPress={() => {
                this.props.onOpenChat(gym.place_id);
              }}
            >
              <View style={styles.chatRowContainer}>
                {gym && gym.photo ? (
                  <Image source={{ uri: gym.photo }} style={styles.gymAvatar} />
                ) : (
                  <View>{getType(SessionType.GYM, 50)}</View>
                )}
                <View style={{ marginHorizontal: 10, flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: '#000' }} numberOfLines={1}>
                    {gym.name}
                  </Text>
                  {gymChat && gymChat.lastMessage && !!gymChat.lastMessage.text && (
                    <Text numberOfLines={1} style={{ color: '#999' }}>
                      {gymChat.lastMessage.text}
                    </Text>
                  )}
                </View>
                {gymChat && gymChat.lastMessage && gymChat.lastMessage.createdAt && (
                  <View style={{ marginHorizontal: 10 }}>
                    <Text style={{ color: '#999' }}>{getSimplifiedTime(gymChat.lastMessage.createdAt)}</Text>
                  </View>
                )}
                <ChatRowCount id={gym.place_id} />
              </View>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#9993' }}>
            <Text style={{ color: colors.primary, textAlign: 'center', marginHorizontal: 20 }}>
              {"You haven't joined a Gym, please join a Gym if you want to participate in Gym chat"}
            </Text>
          </View>
        )}
      </>
    );
  }
}

import { connect } from 'react-redux';
import { navigateGymMessaging } from '../../actions/navigation';
import { fetchGymChat } from '../../actions/chats';
import { GymChatProps } from '../../types/views/chat/GymChat';

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  gymChat: chats.gymChat,
});

const mapDispatchToProps = dispatch => ({
  onOpenChat: gymId => {
    return dispatch(navigateGymMessaging(gymId));
  },
  getChat: gym => dispatch(fetchGymChat(gym)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GymChat);
