import React, {Component} from 'react';
import {View, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import {getType, getSimplifiedTime} from '../../constants/utils';
import ChatRowCount from '../../components/ChatRowCount';
import styles from '../../styles/chatStyles';
import {SessionType} from '../../types/Session';
import {fetchGymChat} from '../../actions/chats';
import {GymChatProps} from '../../types/views/chat/GymChat';
import {Text, Layout} from '@ui-kitten/components';

class GymChat extends Component<GymChatProps, {refreshing: boolean}> {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  render() {
    const {gym, gymChat, getChat, navigation} = this.props;
    const {refreshing} = this.state;
    return (
      <Layout>
        {gym ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  this.setState({refreshing: true});
                  await getChat(gym.place_id);
                  this.setState({refreshing: false});
                }}
              />
            }>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Messaging', {gymId: gym.place_id})
              }>
              <View style={styles.chatRowContainer}>
                {gym && gym.photo ? (
                  <Image source={{uri: gym.photo}} style={styles.gymAvatar} />
                ) : (
                  <View>{getType(SessionType.GYM, 50)}</View>
                )}
                <View
                  style={{
                    marginHorizontal: 10,
                    flex: 1,
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: '#000'}} numberOfLines={1}>
                    {gym.name}
                  </Text>
                  {gymChat &&
                    gymChat.lastMessage &&
                    !!gymChat.lastMessage.text && (
                      <Text numberOfLines={1} style={{color: '#999'}}>
                        {gymChat.lastMessage.text}
                      </Text>
                    )}
                </View>
                {gymChat &&
                  gymChat.lastMessage &&
                  gymChat.lastMessage.createdAt && (
                    <View style={{marginHorizontal: 10}}>
                      <Text style={{color: '#999'}}>
                        {getSimplifiedTime(gymChat.lastMessage.createdAt)}
                      </Text>
                    </View>
                  )}
                <ChatRowCount id={gym.place_id} />
              </View>
            </TouchableOpacity>
          </ScrollView>
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
              {
                "You haven't joined a Gym, please join a Gym if you want to participate in Gym chat"
              }
            </Text>
          </View>
        )}
      </Layout>
    );
  }
}

const mapStateToProps = ({friends, profile, chats}) => ({
  friends: friends.friends,
  profile: profile.profile,
  gym: profile.gym,
  gymChat: chats.gymChat,
});

const mapDispatchToProps = (dispatch) => ({
  getChat: (gym) => dispatch(fetchGymChat(gym)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GymChat);
