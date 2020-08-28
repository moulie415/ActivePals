import React, {Component} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {connect} from 'react-redux';
import {getType, getSimplifiedTime} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import {SessionType} from '../../types/Session';
import {fetchGymChat} from '../../actions/chats';
import {GymChatProps} from '../../types/views/chat/GymChat';
import {Text, Layout, ListItem, Avatar} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';

class GymChat extends Component<GymChatProps, {refreshing: boolean}> {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  render() {
    const {gymChat, getChat, navigation, places, profile} = this.props;
    const {refreshing} = this.state;
    const gym = places[profile.gym];
    return (
      <Layout style={{flex: 1}} level="2">
        {gym && gymChat ? (
          <ListItem
            onPress={() =>
              navigation.navigate('Messaging', {gymId: gym.place_id})
            }
            title={gym.name}
            description={gymChat.lastMessage.text}
            accessoryLeft={() =>
              gym && gym.photo ? (
                <Avatar source={{uri: gym.photo}} size="large" />
              ) : (
                getType(SessionType.GYM, 50)
              )
            }
            accessoryRight={() => (
              <View style={{flexDirection: 'row'}}>
                {gymChat?.lastMessage?.createdAt && (
                  <Text>
                    {getSimplifiedTime(gymChat.lastMessage.createdAt)}
                  </Text>
                )}
                <ChatRowCount id={gym.place_id} />
              </View>
            )}
          />
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
              {
                "You haven't joined a Gym, please join a Gym if you want to participate in Gym chat"
              }
            </Text>
          </Layout>
        )}
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile, chats, sessions}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
  gymChat: chats.gymChat,
  places: sessions.places,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  getChat: (gym: string) => dispatch(fetchGymChat(gym)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GymChat);
