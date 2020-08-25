import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import {getSimplifiedTime, sortChatsByDate} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import DirectMessagesProps from '../../types/views/chat/DirectMessages';
import {Text, List, Layout, ListItem, Avatar, Divider} from '@ui-kitten/components';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import Message from '../../types/Message';
// import  styles  from './styles/loginStyles'

class DirectMessages extends Component<DirectMessagesProps> {
  renderChats() {
    const {navigation, friends, chats, profile} = this.props;

    const getLastMessageText = (lastMessage: Message) => {
      if (lastMessage.text) {
        return lastMessage.text;
      }
      if (!lastMessage.text && lastMessage.image) {
        if (lastMessage.user._id === profile.uid) {
          return 'you sent an image';
        } else {
          return 'sent you an image';
        }
      }
      return '';
    };
    return (
      <List
        ItemSeparatorComponent={Divider}
        data={sortChatsByDate(Object.values(chats))}
        keyExtractor={(chat) => chat.chatId}
        renderItem={({item}) => {
          const friend = friends[item.uid];
          if (friend) {
            return (
              <ListItem
                onPress={() =>
                  navigation.navigate('Messaging', {
                    chatId: item.chatId,
                    friendUsername: friend.username,
                    friendUid: item.uid,
                  })
                }
                title={friend.username}
                description={getLastMessageText(item.lastMessage)}
                accessoryLeft={() =>
                  friend.avatar ? (
                    <Avatar source={{uri: friend.avatar}} size="large" />
                  ) : (
                    <ThemedIcon size={60} name="md-contact" />
                  )
                }
                accessoryRight={() => (
                  <View style={{flexDirection: 'row'}}>
                    {item.lastMessage.createdAt && (
                      <Text>
                        {getSimplifiedTime(item.lastMessage.createdAt)}
                      </Text>
                    )}
                    <ChatRowCount id={item.key} />
                  </View>
                )}
              />
            );
          }
          return null;
        }}
      />
    );
  }

  render() {
    const {chats} = this.props;
    return (
      <Layout style={{ flex: 1}}>
        {Object.values(chats).length > 0 ? (
          this.renderChats()
        ) : (
          <Layout
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}>
            <Text style={{textAlign: 'center'}}>
              {
                "You haven't started any chats yet, also please make sure you are connected to the internet"
              }
            </Text>
          </Layout>
        )}
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile, chats}) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.chats,
});

export default connect(mapStateToProps)(DirectMessages);
