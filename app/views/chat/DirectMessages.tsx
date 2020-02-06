import React, { Component } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { connect } from 'react-redux';
import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../constants/colors';
import { getSimplifiedTime, sortChatsByDate } from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import Text from '../../components/Text';
import DirectMessagesProps from '../../types/views/chat/DirectMessages';
// import  styles  from './styles/loginStyles'

class DirectMessages extends Component<DirectMessagesProps> {
  renderChats() {
    const { navigation, friends, chats, profile } = this.props;
    return (
      <FlatList
        style={{ backgroundColor: colors.bgColor }}
        data={sortChatsByDate(Object.values(chats))}
        keyExtractor={chat => chat.chatId}
        renderItem={({ item }) => {
          const friend = friends[item.uid];
          if (friend) {
            return (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Messaging', {
                    chatId: item.chatId,
                    friendUsername: friend.username,
                    friendUid: item.uid,
                  });
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    marginBottom: 1,
                    padding: 10,
                    paddingVertical: friend.avatar ? 10 : 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {friend.avatar ? (
                    <Image source={{ uri: friend.avatar }} style={{ height: 50, width: 50, borderRadius: 25 }} />
                  ) : (
                    <Icon size={60} name="md-contact" style={{ color: colors.primary }} />
                  )}
                  <View style={{ marginHorizontal: 10, flex: 1, justifyContent: 'center' }}>
                    <Text style={{ color: '#000' }} numberOfLines={1}>
                      {friend.username}
                    </Text>
                    {!!item.lastMessage.text && (
                      <Text numberOfLines={1} style={{ color: '#999' }}>
                        {item.lastMessage.text}
                      </Text>
                    )}
                    {!item.lastMessage.text && item.lastMessage.image && (
                      <Text numberOfLines={1} style={{ color: '#999', fontStyle: 'italic' }}>
                        {item.lastMessage.user._id === profile.uid ? 'you sent an image' : 'sent you an image'}
                      </Text>
                    )}
                  </View>
                  {item.lastMessage.createdAt && (
                    <View style={{ marginHorizontal: 10 }}>
                      <Text style={{ color: '#999' }}>{getSimplifiedTime(item.lastMessage.createdAt)}</Text>
                    </View>
                  )}
                  <ChatRowCount id={item.uid} />
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        }}
      />
    );
  }

  render() {
    const { chats } = this.props;
    return (
      <>
        {Object.values(chats).length > 0 ? (
          this.renderChats()
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
              backgroundColor: colors.bgColor,
            }}
          >
            <Text style={{ color: colors.primary, textAlign: 'center' }}>
              {"You haven't started any chats yet, also please make sure you are connected to the internet"}
            </Text>
          </View>
        )}
      </>
    );
  }
}

const mapStateToProps = ({ friends, profile, chats }) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.chats,
});

export default connect(mapStateToProps)(DirectMessages);
