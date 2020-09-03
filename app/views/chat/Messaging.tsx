import React, {Component} from 'react';
import {Alert, TouchableOpacity, View, BackHandler} from 'react-native';
import database from '@react-native-firebase/database';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {GiftedChat, Bubble, MessageText} from 'react-native-gifted-chat';
import {connect} from 'react-redux';
import globalStyles from '../../styles/globalStyles';
import {guid, sortMessagesByCreatedAt} from '../../constants/utils';
import str from '../../constants/strings';
import {sendRequest, acceptRequest} from '../../actions/friends';
import {
  fetchMessages,
  fetchSessionMessages,
  fetchGymMessages,
  resetNotification,
  resetMessage,
  resetUnreadCount,
  updateLastMessage,
} from '../../actions/chats';
import MessagingProps from '../../types/views/Messaging';
import Message, {MessageType, SessionType} from '../../types/Message';
import {Text, Spinner, Layout} from '@ui-kitten/components';
import {
  MyRootState,
  MyThunkDispatch,
  PushNotificationData,
} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import moment from 'moment';
import Profile from '../../types/Profile';

interface State {
  spinner: boolean;
  showLoadEarlier: boolean;
  messages: Message[];
  amount: number;
  text?: string;
}

class Messaging extends Component<MessagingProps, State> {
  constructor(props) {
    super(props);
    const {messageSession} = this.props;
    this.state = {
      messages: messageSession ? Object.values(messageSession) : [],
      spinner: false,
      amount: 15,
      showLoadEarlier: true,
    };
  }

  componentDidMount() {
    const {unreadCount, onResetUnreadCount, route} = this.props;

    const {gymId, friendUid, sessionId} = route.params;
    BackHandler.addEventListener('hardwareBackPress', () => this.onBackPress());
    this.loadMessages();
    const id = friendUid || sessionId || gymId;
    if (id) {
      const count = unreadCount[id];
      if (count && count > 0) {
        onResetUnreadCount(id);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {profile, onResetMessage, resetNotif, route} = this.props;

    const {friendUid, gymId, sessionId} = route.params;
    const {messages} = this.state;
    // message it populated when an attachment is sent
    if (nextProps.message) {
      const message = {
        _id: guid(),
        createdAt: new Date(),
        text: nextProps.message.text,
        image: nextProps.message.url,
        user: {
          _id: profile.uid,
          name: profile.username,
          avatar: profile.avatar,
        },
        type: this.getType(),
      };
      this.onSend([message]);
      onResetMessage();
    }
    if (nextProps.messageSession) {
      const {messageSession}: {[key: string]: Message} = nextProps;
      this.setState({messages: Object.values(messageSession), spinner: false});
      if (
        messageSession &&
        Object.values(messageSession).some((message) => message._id === 1)
      ) {
        this.setState({showLoadEarlier: false});
      }
    }
    if (nextProps.notif) {
      resetNotif();
      // ignore inital fetch when component mounts
      const {
        type,
        uid,
        username,
        _id,
        body,
        sessionId: messageSessionId,
        avatar,
        createdAt,
        gymId: messageGymId,
        image,
        sessionType,
      } = nextProps.notif;
      if (
        type === MessageType.MESSAGE ||
        type === MessageType.SESSION_MESSAGE ||
        type === MessageType.GYM_MESSAGE
      ) {
        const date = new Date(createdAt);
        const message = {
          createdAt: date,
          _id,
          text: body,
          user: {_id: uid, name: username, avatar},
          image,
          type,
          sessionType,
        };
        if (
          (type === MessageType.MESSAGE && friendUid === uid) ||
          (type === MessageType.SESSION_MESSAGE &&
            messageSessionId === sessionId &&
            profile.uid !== uid) ||
          (type === MessageType.GYM_MESSAGE &&
            messageGymId === gymId &&
            profile.uid !== uid)
        ) {
          // check if its a dupe
          if (!messages.some((msg) => msg._id === message._id)) {
            this.setState((previousState) => ({
              messages: previousState.messages
                ? [...previousState.messages, message]
                : [message],
            }));
          }
        }
      }
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', () =>
      this.onBackPress(),
    );
  }

  onBackPress() {
    const {navigation, onResetUnreadCount, unreadCount, route} = this.props;
    const {gymId, friendUid, sessionId} = route.params;

    navigation.goBack();
    const id = friendUid || sessionId || gymId;
    if (id) {
      const count = unreadCount[id];
      if (count && count > 0) {
        onResetUnreadCount(id);
      }
    }

    return true;
  }

  async onSend(messages: Message[] = []) {
    const {gym, onUpdateLastMessage, route, sessions} = this.props;
    const {friendUid, gymId, sessionId, chatId} = route.params;
    const session = sessions[sessionId];
    // make messages database friendly
    const converted = messages.map((message) => {
      const type = this.getType();
      const createdAt = moment().utc().valueOf();

      if (session) {
        const {title: sessionTitle} = session;
        const sessionType: SessionType = session.private
          ? 'privateSessions'
          : 'sessions';
        return {
          ...message,
          createdAt,
          sessionTitle,
          sessionId,
          sessionType,
          type,
        };
      }
      if (gymId) {
        const {name} = gym;
        return {...message, createdAt, gymId, gymName: name, type};
      }
      return {...message, createdAt, chatId, friendUid, type};
    });

    const ref = this.getDbRef();

    try {
      const dbFriendly = converted.map((msg) => {
        return {...msg, createdAt: moment(msg.createdAt).utc().format()};
      });
      await ref.push(...dbFriendly);
      this.setState((previousState) => ({
        messages: [...previousState.messages, ...messages],
      }));

      if (session) {
        onUpdateLastMessage({...converted[0]});
      } else if (gymId) {
        onUpdateLastMessage({...converted[0]});
      } else {
        onUpdateLastMessage({...converted[0]});
      }
    } catch (e) {
      Alert.alert('Error sending message', e.message);
    }
  }

  getType() {
    const {route} = this.props;
    const {gymId, sessionId} = route.params;
    if (sessionId) {
      return MessageType.SESSION_MESSAGE;
    }
    if (gymId) {
      return MessageType.GYM_MESSAGE;
    }
    return MessageType.MESSAGE;
  }

  getDbRef() {
    const {route} = this.props;
    const {gymId, sessionId, chatId} = route.params;
    if (sessionId) {
      return database().ref('sessionChats').child(sessionId);
    }
    if (gymId) {
      return database().ref('gymChats').child(gymId);
    }
    if (chatId) {
      return database().ref('chats').child(chatId);
    }
  }

  getRightHandIcon() {
    const {navigation, route, sessions} = this.props;
    const {gymId, sessionId} = route.params;
    if (gymId) {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('Gym', {id: gymId})}>
          <ThemedIcon size={25} name="info" />
        </TouchableOpacity>
      );
    }
    if (sessionId) {
      const session = sessions[sessionId];
      if (session) {
        const {key, private: isPrivate} = session;
        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('SessionInfo', {sessionId: key, isPrivate})
            }>
            <ThemedIcon size={25} name="info" />
          </TouchableOpacity>
        );
      }
    }
    return null;
  }

  loadMessages(endAt?: string) {
    const {
      getSessionMessages,
      getGymMessages,
      getMessages,
      route,
      sessions,
    } = this.props;
    const {amount} = this.state;
    const {friendUid, gymId, sessionId, chatId} = route.params;
    const session = sessions[sessionId];
    this.setState({spinner: true});
    if (session) {
      const {key, private: isPrivate} = session;
      getSessionMessages(key, amount, isPrivate, endAt);
    } else if (gymId) {
      getGymMessages(gymId, amount, endAt);
    } else {
      getMessages(chatId, amount, friendUid, endAt);
    }
  }

  showPicker() {
    const {navigation} = this.props;
    const {text} = this.state;
    const videoOptions: ImagePickerOptions = {
      mediaType: 'video',
      durationLimit: 30,
    };
    const options: ImagePickerOptions = {
      title: '',
      mediaType: 'photo',
      // customButtons: [
      // {name: 'video', title: 'Shoot video (coming soon)'},
      // {name: 'uploadVideo', title: 'Choose video from library (coming soon)'},
      // ],
      noData: true,
      storageOptions: {
        skipBackup: true,
      },
    };
    ImagePicker.showImagePicker(options, async (response) => {
      this.setState({spinner: true});
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({spinner: false});
      } else if (response.error) {
        Alert.alert('Error', response.error);
        this.setState({spinner: false});
      } else if (response.customButton) {
        if (response.customButton === 'uploadVideo') {
          ImagePicker.launchImageLibrary(videoOptions, (imageResponse) => {
            if (imageResponse.error) {
              Alert.alert('Error', imageResponse.error);
              this.setState({spinner: false});
            }
          });
        } else if (response.customButton === 'video') {
          ImagePicker.launchCamera(videoOptions, (videoResponse) => {
            if (videoResponse.error) {
              Alert.alert('Error', videoResponse.error);
              this.setState({spinner: false});
            }
          });
        }
      } else {
        const size = 720;
        try {
          const resized = await ImageResizer.createResizedImage(
            response.uri,
            size,
            size,
            'JPEG',
            100,
          );
          this.setState({spinner: false});
          navigation.navigate('FilePreview', {
            type: 'image',
            uri: resized.uri,
            message: true,
            text,
          });
        } catch (e) {
          Alert.alert('Error', e.message);
          this.setState({spinner: false});
        }
      }
    });
  }

  async openChat(user: Profile) {
    const {profile, navigation} = this.props;
    const snapshot = await database()
      .ref(`userChats/${profile.uid}`)
      .child(user.uid)
      .once('value');
    if (snapshot.val()) {
      navigation.navigate('Messaging', {
        chatId: snapshot.val(),
        friendUsername: user.username,
        friendUid: user.uid,
      });
    }
  }

  render() {
    const {navigation, profile, friends, users} = this.props;
    const {messages, showLoadEarlier, spinner, text} = this.state;

    return (
      <Layout style={{flex: 1}}>
        <GiftedChat
          text={text}
          onInputTextChanged={(input) => this.setState({text: input})}
          messages={sortMessagesByCreatedAt(messages).reverse()}
          inverted={false}
          onSend={(msgs) => {
            if (profile.username) {
              this.onSend(msgs);
            } else {
              Alert.alert(
                'Username not set',
                'You need a username before sending messages, go to your profile now?',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'OK', onPress: () => navigation.navigate('Profile')},
                ],
              );
            }
          }}
          onPressAvatar={(user) =>
            navigation.navigate('ProfileView', {uid: user._id})
          }
          onLoadEarlier={() => {
            const sorted = sortMessagesByCreatedAt(messages);
            const endAt = sorted[sorted.length - 1].key;
            this.setState({spinner: true}, () => this.loadMessages(endAt));
          }}
          loadEarlier={messages && messages.length > 14 && showLoadEarlier}
          user={{
            _id: profile.uid,
            name: profile.username,
            avatar: profile.avatar,
          }}
          renderBubble={(props) => {
            return <Bubble {...props} />;
          }}
          renderMessageText={(props) => {
            // @ts-ignore
            const {previousMessage, currentMessage, position} = props;
            return (
              <View>
                {((previousMessage.user &&
                  position === 'left' &&
                  previousMessage.user._id !== currentMessage.user._id) ||
                  (!previousMessage.user &&
                    currentMessage.user &&
                    position === 'left')) && (
                  <Text
                    style={{
                      fontSize: 12,
                      padding: 10,
                      paddingBottom: 0,
                    }}>
                    {props.currentMessage.user.name}
                  </Text>
                )}
                <MessageText {...props} />
              </View>
            );
          }}
          renderActions={() => {
            return (
              <TouchableOpacity onPress={() => this.showPicker()}>
                <ThemedIcon size={25} name="attach-2" />
              </TouchableOpacity>
            );
          }}
          // @ts-ignore
          parsePatterns={(linkStyle) => [
            {
              pattern: str.mentionRegex,
              style: linkStyle,
              onPress: async (mention) => {
                const name = mention.substring(1);
                const combined = [
                  ...Object.values(friends),
                  ...Object.values(users),
                ];
                if (name === profile.username) {
                  navigation.navigate('Profile');
                } else {
                  const found = combined.find(
                    (friend) => friend.username === name,
                  );
                  if (found) {
                    navigation.navigate('ProfileView', {uid: found.uid});
                  } else {
                    try {
                      const snapshot = await database()
                        .ref('usernames')
                        .child(name)
                        .once('value');
                      if (snapshot.val()) {
                        navigation.navigate('ProfileView', {
                          uid: snapshot.val(),
                        });
                      }
                    } catch (e) {
                      console.warn(e.message);
                    }
                  }
                }
              },
            },
          ]}
        />
        {spinner && (
          <Layout style={globalStyles.indicator}>
            <Spinner />
          </Layout>
        )}
      </Layout>
    );
  }
}

const fetchId = (params) => {
  if (params.sessionId) {
    return params.sessionId;
  }
  if (params.gymId) {
    return params.gymId;
  }
  return params.chatId;
};

const mapStateToProps = (
  {friends, profile, chats, sharedInfo, sessions}: MyRootState,
  ownProps,
) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  sessionChats: chats.sessionChats,
  chats: chats.chats,
  message: chats.message,
  gymChat: chats.gymChat,
  messageSession: chats.messageSessions[fetchId(ownProps.route.params)],
  notif: chats.notif,
  unreadCount: chats.unreadCount,
  sessions: {...sessions.sessions, ...sessions.privateSessions},
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  onUpdateLastMessage: (message: PushNotificationData) =>
    dispatch(updateLastMessage(message)),
  onRequest: (friendUid: string) => dispatch(sendRequest(friendUid)),
  onAccept: (uid: string, friendUid: string) =>
    dispatch(acceptRequest(uid, friendUid)),
  getMessages: (id: string, amount: number, uid: string, endAt: string) =>
    dispatch(fetchMessages(id, amount, uid, endAt)),
  getSessionMessages: (
    id: string,
    amount: number,
    isPrivate: boolean,
    endAt: string,
  ) => dispatch(fetchSessionMessages(id, amount, isPrivate, endAt)),
  getGymMessages: (id: string, amount: number, endAt: string) =>
    dispatch(fetchGymMessages(id, amount, endAt)),
  resetNotif: () => dispatch(resetNotification()),
  onResetMessage: () => dispatch(resetMessage()),
  onResetUnreadCount: (id: string) => dispatch(resetUnreadCount(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Messaging);
