import React, {Component, FunctionComponent, useEffect} from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {getType, getSimplifiedTime} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import {SessionType} from '../../types/Session';
import {fetchGymChat} from '../../actions/chats';
import {GymChatProps} from '../../types/views/chat/GymChat';
import {Text, Layout, ListItem} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import Avatar from '../../components/Avatar/Avatar';
import {fetchGym} from '../../actions/sessions';

const GymChat: FunctionComponent<GymChatProps> = ({
  gymChat,
  navigation,
  places,
  profile,
  getGym,
}) => {

  const gym = places[profile.gym];
  useEffect(() => {
    if (!places[profile.gym]) {
      getGym(profile.gym);
    }
  }, [getGym, profile.gym, places]);
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
              <Avatar uri={gym.photo} size={50} />
            ) : (
              getType(SessionType.GYM, 50)
            )
          }
          accessoryRight={() => (
            <View style={{flexDirection: 'row'}}>
              {gymChat?.lastMessage?.createdAt && (
                <Text>{getSimplifiedTime(gymChat.lastMessage.createdAt)}</Text>
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
};

const mapStateToProps = ({friends, profile, chats, sessions}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
  gymChat: chats.gymChat,
  places: sessions.places,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  getChat: (gym: string) => dispatch(fetchGymChat(gym)),
  getGym: (id: string) => dispatch(fetchGym(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GymChat);
