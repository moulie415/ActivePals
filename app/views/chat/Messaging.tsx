import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
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
import MessagingProps, {MessagingRouteProp} from '../../types/views/Messaging';
import Message, {MessageType, SessionType} from '../../types/Message';
import {Text, Spinner, Layout} from '@ui-kitten/components';
import {
  MyRootState,
  MyThunkDispatch,
  PushNotificationData,
} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import moment from 'moment';

const Messaging: FunctionComponent<MessagingProps> = ({
  navigation,
  route,
  unreadCount,
  onResetUnreadCount,
  profile,
  onResetMessage,
  resetNotif,
  gym,
  messageSession,
  friends,
  users,
  getMessages,
  getSessionMessages,
  getGymMessages,
  onUpdateLastMessage,
  sessions,
  message,
  notif,
}) => {
  const [messages, setMessages] = useState<Message[]>(
    messageSession ? Object.values(messageSession) : [],
  );
  const [spinner, setSpinner] = useState(false);
  const [showLoadEarlier, setShowLoadEarlier] = useState(true);
  const [text, setText] = useState('');

  const amount = 15;

  const onBackPress = useCallback(() => {
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
  }, [navigation, onResetUnreadCount, route.params, unreadCount]);

  const loadMessages = useCallback(
    (endAt?: string) => {
      const {friendUid, gymId, sessionId, chatId} = route.params;
      setSpinner(true);
      if (sessionId) {
        const session = sessions[sessionId];
        const {key, private: isPrivate} = session;
        if (key) {
          getSessionMessages(key, amount, isPrivate, endAt);
        }
      } else if (gymId) {
        getGymMessages(gymId, amount, endAt);
      } else if (chatId && friendUid) {
        getMessages(chatId, amount, friendUid, endAt);
      }
    },
    [
      amount,
      getSessionMessages,
      getGymMessages,
      getMessages,
      route.params,
      sessions,
    ],
  );

  useEffect(() => {
    const {gymId, friendUid, sessionId} = route.params;
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    loadMessages();
    const id = friendUid || sessionId || gymId;
    if (id) {
      const count = unreadCount[id];
      if (count && count > 0) {
        onResetUnreadCount(id);
      }
    }
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [
    loadMessages,
    onBackPress,
    onResetUnreadCount,
    route.params,
    unreadCount,
  ]);

  const getType = useCallback(() => {
    const {gymId, sessionId} = route.params;
    if (sessionId) {
      return MessageType.SESSION_MESSAGE;
    }
    if (gymId) {
      return MessageType.GYM_MESSAGE;
    }
    return MessageType.MESSAGE;
  }, [route.params]);

  const getDbRef = useCallback(() => {
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
  }, [route.params]);

  const onSend = useCallback(
    async (newMessages: Message[] = []) => {
      const {friendUid, gymId, sessionId, chatId} = route.params;

      // make messages database friendly
      const converted = newMessages.map((message) => {
        const type = getType();
        const createdAt = moment().utc().valueOf();

        if (sessionId) {
          const session = sessions[sessionId];
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
        if (gymId && gym) {
          const {name} = gym;
          return {...message, createdAt, gymId, gymName: name, type};
        }
        return {...message, createdAt, chatId, friendUid, type};
      });

      const ref = getDbRef();
      if (ref) {
        try {
          const dbFriendly = converted.map((msg) => {
            return {...msg, createdAt: moment(msg.createdAt).utc().format()};
          });
          await ref.push(...dbFriendly);
          setMessages([...messages, ...newMessages]);

          if (sessionId) {
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
    },
    [
      getDbRef,
      getType,
      gym,
      messages,
      onUpdateLastMessage,
      route.params,
      sessions,
    ],
  );

  useEffect(() => {
    if (message) {
      const messageObj = {
        _id: guid(),
        createdAt: new Date(),
        text: message.text,
        image: message.url,
        user: {
          _id: profile.uid,
          name: profile.username,
          avatar: profile.avatar,
        },
        type: getType(),
      };
      onSend([messageObj]);
      onResetMessage();
    }
  }, [getType, message, onResetMessage, onSend, profile]);

  useEffect(() => {
    if (messageSession) {
      setMessages(Object.values(messageSession));
      setSpinner(false);
      if (
        messageSession &&
        Object.values(messageSession).some((msg) => msg._id === 1)
      ) {
        setShowLoadEarlier(false);
      }
    }
  }, [messageSession]);

  useEffect(() => {
    if (notif) {
      const {friendUid, sessionId, gymId} = route.params;
      resetNotif();
      // ignore initial fetch when component mounts
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
      } = notif;
      if (
        type === MessageType.MESSAGE ||
        type === MessageType.SESSION_MESSAGE ||
        type === MessageType.GYM_MESSAGE
      ) {
        const date = new Date(createdAt);
        const messageObj = {
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
          if (!messages.some((msg) => msg._id === messageObj._id)) {
            if (messages) {
              setMessages([...messages, messageObj]);
            }
            setMessages([messageObj]);
          }
          const id = friendUid || sessionId || gymId;
          if (id) {
            const count = unreadCount[id];
            if (count && count > 0) {
              onResetUnreadCount(id);
            }
          }
        }
      }
    }
  }, [
    messages,
    notif,
    onResetUnreadCount,
    profile.uid,
    resetNotif,
    route.params,
    unreadCount,
  ]);

  const showPicker = () => {
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
      setSpinner(true);
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
        setSpinner(false);
      } else if (response.error) {
        Alert.alert('Error', response.error);
        setSpinner(false);
      } else if (response.customButton) {
        if (response.customButton === 'uploadVideo') {
          ImagePicker.launchImageLibrary(videoOptions, (imageResponse) => {
            if (imageResponse.error) {
              Alert.alert('Error', imageResponse.error);
              setSpinner(false);
            }
          });
        } else if (response.customButton === 'video') {
          ImagePicker.launchCamera(videoOptions, (videoResponse) => {
            if (videoResponse.error) {
              Alert.alert('Error', videoResponse.error);
              setSpinner(false);
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
          setSpinner(false);
          navigation.navigate('FilePreview', {
            type: 'image',
            uri: resized.uri,
            message: true,
            text,
          });
        } catch (e) {
          Alert.alert('Error', e.message);
          setSpinner(false);
        }
      }
    });
  };

  return (
    <Layout style={{flex: 1}}>
      <GiftedChat
        text={text}
        onInputTextChanged={(input) => setText(input)}
        messages={sortMessagesByCreatedAt(messages).reverse()}
        inverted={false}
        onSend={(msgs) => {
          if (profile.username) {
            onSend(msgs);
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
          setSpinner(true);
          loadMessages(endAt);
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
            <TouchableOpacity
              style={{paddingBottom: 10, paddingLeft: 10}}
              onPress={showPicker}>
              <ThemedIcon size={30} name="attach-2" />
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
};

const fetchId = (route: MessagingRouteProp) => {
  const {sessionId, gymId, chatId} = route.params;
  if (sessionId) {
    return sessionId;
  }
  if (gymId) {
    return gymId;
  }
  return chatId;
};

const mapStateToProps = (
  {friends, profile, chats, sharedInfo, sessions}: MyRootState,
  ownProps: MessagingProps,
) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  sessionChats: chats.sessionChats,
  chats: chats.chats,
  message: chats.message,
  gymChat: chats.gymChat,
  messageSession: chats.messageSessions[fetchId(ownProps.route) || ''],
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
  getMessages: (id: string, amount: number, uid: string, endAt?: string) =>
    dispatch(fetchMessages(id, amount, uid, endAt)),
  getSessionMessages: (
    id: string,
    amount: number,
    isPrivate: boolean,
    endAt?: string,
  ) => dispatch(fetchSessionMessages(id, amount, isPrivate, endAt)),
  getGymMessages: (id: string, amount: number, endAt?: string) =>
    dispatch(fetchGymMessages(id, amount, endAt)),
  resetNotif: () => dispatch(resetNotification()),
  onResetMessage: () => dispatch(resetMessage()),
  onResetUnreadCount: (id: string) => dispatch(resetUnreadCount(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Messaging);
