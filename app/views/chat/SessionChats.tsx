import React, {Component} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {
  getType,
  getSimplifiedTime,
  sortChatsByDate,
} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import SessionChatsProps from '../../types/views/chat/SessionChats';
import {Text, Layout, List, ListItem, Divider} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';

class SessionChats extends Component<SessionChatsProps> {
  renderChats() {
    const {chats, navigation} = this.props;
    return (
      <List
        ItemSeparatorComponent={Divider}
        data={sortChatsByDate(Object.values(chats))}
        keyExtractor={(chat) => chat.key}
        renderItem={({item}) => {
          return (
            <ListItem
              onPress={() =>
                navigation.navigate('Messaging', {sessionId: item.key})
              }
              title={item.title}
              description={item.lastMessage.text}
              accessoryLeft={() => getType(item.type, 50)}
              accessoryRight={() => (
                <View style={{flexDirection: 'row'}}>
                  {item.lastMessage.createdAt && (
                    <Text>{getSimplifiedTime(item.lastMessage.createdAt)}</Text>
                  )}
                  <ChatRowCount id={item.key} />
                </View>
              )}
            />
          );
        }}
      />
    );
  }

  render() {
    const {chats} = this.props;
    return (
      <Layout style={{flex: 1}}>
        {Object.values(chats).length > 0 && Object.values(chats)[0].type ? (
          this.renderChats()
        ) : (
          <Layout
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                marginHorizontal: 20,
              }}>
              You haven't joined any sessions yet, join a session to start a
              session chat also please make sure you are connected to the
              internet
            </Text>
          </Layout>
        )}
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile, chats}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats,
});

export default connect(mapStateToProps)(SessionChats);
