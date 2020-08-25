import React, {Component} from 'react';
import {View, TouchableOpacity, FlatList} from 'react-native';
import {connect} from 'react-redux';
import {
  getType,
  getSimplifiedTime,
  sortChatsByDate,
} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import SessionChatsProps from '../../types/views/chat/SessionChats';
import {Text} from '@ui-kitten/components';

class SessionChats extends Component<SessionChatsProps> {
  renderChats() {
    const {chats, navigation} = this.props;
    return (
      <FlatList
        data={sortChatsByDate(Object.values(chats))}
        keyExtractor={(chat) => chat.key}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('Messaging', {session: item})}>
              <View
                style={{
                  backgroundColor: '#fff',
                  marginBottom: 1,
                  padding: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View>{getType(item.type, 50)}</View>
                <View
                  style={{
                    marginHorizontal: 10,
                    flex: 1,
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: '#000'}} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!!item.lastMessage.text && (
                    <Text numberOfLines={1} style={{color: '#999'}}>
                      {item.lastMessage.text}
                    </Text>
                  )}
                </View>
                {item.lastMessage.createdAt && (
                  <View style={{marginHorizontal: 10}}>
                    <Text style={{color: '#999'}}>
                      {getSimplifiedTime(item.lastMessage.createdAt)}
                    </Text>
                  </View>
                )}
                <ChatRowCount id={item.key} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  }

  render() {
    const {chats} = this.props;
    return (
      <>
        {Object.values(chats).length > 0 && Object.values(chats)[0].type ? (
          this.renderChats()
        ) : (
          <View
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
          </View>
        )}
      </>
    );
  }
}

const mapStateToProps = ({friends, profile, chats}) => ({
  friends: friends.friends,
  profile: profile.profile,
  chats: chats.sessionChats,
});

export default connect(mapStateToProps)(SessionChats);
