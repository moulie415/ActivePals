import React, { Component } from 'react';
import {
  View,
  Alert,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image as SlowImage,
} from 'react-native';
import { connect } from 'react-redux';
import ImagePicker, { ImagePickerOptions } from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalBox from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import { PulseIndicator } from 'react-native-indicators';
import firebase from 'react-native-firebase';
import Video from 'react-native-video';
import Share, { Options } from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import Image from 'react-native-fast-image';
import VideoCompress from 'react-native-video-compressor';
import ActionSheet from 'react-native-actionsheet';
import Card from '../components/Card';
import colors from '../constants/colors';
import styles from '../styles/homeStyles';
import sStyles from '../styles/settingsStyles';
import Text from '../components/Text';
import Comments from '../components/comments';
import Header from '../components/Header/header';
import { likesExtractor, getSimplifiedTime, getMentionsList, sortPostsByDate } from '../constants/utils';
import ParsedText from '../components/ParsedText';
import AdView from '../components/AdView';
import Post, { PostType } from '../types/Post';
import HomeProps from '../types/views/Home';
import RepsModal from '../components/RepsModal';
import {
  addPost,
  repPost,
  postComment,
  fetchComments,
  repComment,
  fetchPosts,
  fetchCommentRepsUsers,
  fetchRepsUsers,
  fetchReplies,
} from '../actions/home';
import Comment from '../types/Comment';
import Profile from '../types/Profile';

const weightUp = require('../../assets/images/weightlifting_up.png');
const weightDown = require('../../assets/images/weightlifting_down.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_VIDEO_SIZE = 30000000; // 30mb

interface State {
  spinner: boolean;
  selectedImage?: { url: string }[];
  showImage: boolean;
  refreshing: boolean;
  likesModalVisible: boolean;
  loadMore: boolean;
  playing: { [key: string]: boolean };
  status?: string;
  focusCommentInput?: boolean;
  postId: string;
  repsId: string;
  repCount: number;
  showCommentModal: boolean;
  mentionList: Profile[];
  selectedPost?: string;
}
export class Home extends Component<HomeProps, State> {
  ActionSheet: ActionSheet;

  players: { [key: string]: Video };

  scrollIndex: number;

  input: TextInput;

  constructor(props) {
    super(props);
    this.players = {};
    this.scrollIndex = 0;
    this.state = {
      spinner: false,
      selectedImage: null,
      showImage: false,
      refreshing: false,
      likesModalVisible: false,
      loadMore: true,
      playing: {},
      postId: '',
      repsId: '',
      repCount: 0,
      showCommentModal: false,
      mentionList: [],
    };
  }

  componentDidMount() {
    firebase
      .messaging()
      .requestPermission()
      .then(() => {
        console.log('messaging permission granted');
      })
      .catch(error => {
        console.log('messaging permission denied');
      });
  }

  getUsername(uid) {
    const { friends, users } = this.props;
    if (friends[uid]) {
      return friends[uid].username;
    }
    if (users[uid]) {
      return users[uid].username;
    }
    return 'N/A';
  }

  getUsernameFormatted(uid) {
    const { profile, navigation } = this.props;
    return (
      <TouchableOpacity
        onPress={() => {
          uid !== profile.uid ? navigation.navigate('ProfileView', { uid }) : navigation.navigate('Profile');
        }}
      >
        <Text style={{ fontWeight: 'bold', color: colors.secondary, flex: 1 }}>
          {uid === profile.uid ? 'You' : this.getUsername(uid)}
        </Text>
      </TouchableOpacity>
    );
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Home',
    tabBarIcon: ({ tintColor }) => <Icon name="md-home" size={25} style={{ color: tintColor }} />,
  };

  repCommentCount(item) {
    const { getRepsUsers, getComments } = this.props;
    if ((item.repCount && item.repCount > 0) || (item.commentCount && item.commentCount > 0)) {
      return (
        <View>
          <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5 }} />
          <View style={{ marginHorizontal: 10, flexDirection: 'row' }}>
            {!!item.repCount && item.repCount > 0 && (
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={async () => {
                  this.setState({ likesModalVisible: true, repsId: item.key, repCount: item.repCount });
                  await getRepsUsers(item.key);
                }}
              >
                <Text style={{ color: '#999' }}>{`${item.repCount} ${item.repCount > 1 ? ' reps' : ' rep'}`}</Text>
              </TouchableOpacity>
            )}
            {!!item.commentCount && item.commentCount > 0 && (
              <TouchableOpacity
                style={{ alignSelf: 'flex-end', flex: 1 }}
                onPress={() => {
                  this.setState({ postId: item.key, showCommentModal: true });
                  getComments(item.key);
                }}
              >
                <Text style={{ color: '#999', textAlign: 'right' }}>
                  {`${item.commentCount} ${item.commentCount > 1 ? ' comments' : ' comment'}`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5 }} />
        </View>
      );
    }
    return <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5 }} />;
  }

  repsAndComments(item) {
    const { onRepPost, getComments } = this.props;
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {item.type !== 'video' && (
          <TouchableOpacity
            onPress={() => {
              this.sharePost(item);
            }}
            style={{ flexDirection: 'row', paddingHorizontal: 25, alignItems: 'center' }}
          >
            <Icon size={25} style={{ color: colors.postIcon }} name="md-share" />
            {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Share</Text> */}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onRepPost(item)}
          style={{ flexDirection: 'row', paddingHorizontal: 25, alignItems: 'center' }}
        >
          <SlowImage
            source={item.rep ? weightUp : weightDown}
            style={{ width: 25, height: 25, tintColor: item.rep ? colors.secondary : colors.postIcon }}
          />
          {/* <Text style={{color: item.rep ? colors.secondary : colors.postIcon, marginLeft: 10}}>Rep</Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.setState({ focusCommentInput: true, postId: item.key, showCommentModal: true });
            getComments(item.key);
          }}
          style={{ flexDirection: 'row', paddingHorizontal: 25, alignItems: 'center' }}
        >
          <Icon name="md-chatboxes" size={25} style={{ color: colors.postIcon }} />
          {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Comment</Text> */}
        </TouchableOpacity>
      </View>
    );
  }

  showPicker() {
    const options: ImagePickerOptions = {
      title: null,
      mediaType: 'mixed',
      noData: true,
      storageOptions: {
        skipBackup: true,
      },
      durationLimit: 60,
      allowsEditing: true,
      takePhotoButtonTitle: 'Take photo/video',
    };
    ImagePicker.showImagePicker(options, async response => {
      this.setState({ spinner: true });
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({ spinner: false });
      } else if (response.error) {
        Alert.alert('Error', response.error);
        this.setState({ spinner: false });
      } else {
        const { navigation } = this.props;
        const { status } = this.state;
        if (response.type && response.type.includes('image')) {
          const size = 720;
          const resized = await ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100);
          this.setState({ spinner: false });
          navigation.navigate('FilePreview', { type: 'image', uri: resized.uri, message: false, text: status });
        } else {
          await this.processVideo(response.uri);
          this.setState({ spinner: false });
        }
      }
    });
  }

  async processVideo(uri) {
    const { navigation } = this.props;
    const { status } = this.state;
    // @TODO compress android
    // if (Platform.OS === 'android') {
    //   const data = await VideoCompress.compress(uri);
    //   console.log(data);
    // }
    const statURI = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    try {
      const stats = await RNFetchBlob.fs.stat(statURI);
      console.log(stats);
      if (Number(stats.size) < MAX_VIDEO_SIZE) {
        navigation.navigate('FilePreview', { type: 'video', uri, message: false, text: status });
      } else {
        Alert.alert('Error', 'Sorry the file size is too large');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async sharePost(item) {
    const { profile } = this.props;
    this.setState({ spinner: true });
    const { username } = profile;
    const text = item.text ? `"${item.text}"` : '';
    const options: Options = {
      message: `${username} shared a post from ActivePals:\n ${text}`,
      title: `Share ${item.type}?`,
    };
    if (item.type === 'photo') {
      try {
        const resp = await RNFetchBlob.config({ fileCache: false }).fetch('GET', item.url);
        const base64 = await resp.base64();
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        options.url = dataUrl;
      } catch (e) {
        Alert.alert('Error', 'There was a problem sharing the photo');
        this.setState({ spinner: false });
        return;
      }
    }
    try {
      await Share.open(options);
      Alert.alert('Success', 'Post Shared');
      this.setState({ spinner: false });
    } catch (e) {
      this.setState({ spinner: false });
      console.log(e);
    }
  }

  renderAvatar(uid) {
    const { profile, friends, navigation } = this.props;
    if (profile.avatar && uid === profile.uid) {
      return (
        <TouchableOpacity
          onPress={() =>
            uid !== profile.uid ? navigation.navigate('ProfileView', { uid }) : navigation.navigate('Profile')
          }
        >
          <Image
            source={{ uri: profile.avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    }
    if (friends[uid] && friends[uid].avatar) {
      return (
        <TouchableOpacity
          onPress={() =>
            uid !== profile.uid ? navigation.navigate('ProfileView', { uid }) : navigation.navigate('Profile')
          }
        >
          <Image
            source={{ uri: friends[uid].avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() =>
          uid !== profile.uid ? navigation.navigate('ProfileView', { uid }) : navigation.navigate('Profile')
        }
      >
        <Icon name="md-contact" style={{ fontSize: 45, color: colors.primary, marginRight: 10 }} />
      </TouchableOpacity>
    );
  }

  renderFeedItem(item: Post) {
    const { playing } = this.state;
    const { navigation } = this.props;
    switch (item.type) {
      case PostType.STATUS:
        return (
          <View style={{ padding: 10, margin: 5 }}>
            <View style={{ flexDirection: 'row', flex: 1, marginBottom: 10 }}>
              {this.renderAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => this.setState({ selectedPost: item.key }, () => this.ActionSheet.show())}
              >
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 5 }}>
              <ParsedText text={item.text} style={{ color: colors.textGrey }} />
            </View>
            {this.repCommentCount(item)}
            {this.repsAndComments(item)}
          </View>
        );
      case PostType.PHOTO:
        return (
          <View>
            <View style={{ flexDirection: 'row', flex: 1, padding: 10 }}>
              {this.renderAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => this.setState({ selectedPost: item.key }, () => this.ActionSheet.show())}
              >
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ margin: 5, marginHorizontal: 10 }}>
              <ParsedText text={item.text} style={{ color: colors.textGrey }} />
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.setState({ selectedImage: [{ url: item.url }], showImage: true })}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <Image style={{ width: '100%', height: 400 }} resizeMode="cover" source={{ uri: item.url }} />
            </TouchableOpacity>
            {this.repCommentCount(item)}
            <View style={{ padding: 10 }}>{this.repsAndComments(item)}</View>
          </View>
        );
      case PostType.VIDEO:
        return (
          <View>
            <View style={{ flexDirection: 'row', flex: 1, padding: 10, zIndex: 2 }}>
              {this.renderAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => this.setState({ selectedPost: item.key }, () => this.ActionSheet.show())}
              >
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ margin: 10 }}>
              <ParsedText text={item.text} style={{ color: colors.textGrey }} />
            </View>
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({ playing: { [item.uid]: false } });
              }}
            >
              <Video
                ref={ref => {
                  this.players[item.key] = ref;
                }}
                source={{ uri: item.url }}
                style={{ width: '100%', height: 400 }}
                paused={!playing[item.key]}
                ignoreSilentSwitch="ignore"
                repeat
                onFullscreenPlayerDidPresent={() => this.setState({ playing: { [item.key]: false } })}
                resizeMode="cover"
                onBuffer={() => {
                  console.log('buffering');
                }} // Callback when remote video is buffering
                onError={e => Alert.alert('Error', e.error.errorString)}
              />
            </TouchableWithoutFeedback>
            {!playing[item.key] && (
              <View style={styles.playButtonContainer}>
                <TouchableOpacity onPress={() => this.setState({ playing: { [item.key]: true } })}>
                  <Icon
                    size={50}
                    name="md-play"
                    style={{ color: '#fff', backgroundColor: 'transparent', opacity: 0.8 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    bottom:
                      (item.repCount && item.repCount > 0) || (item.commentCount && item.commentCount > 0) ? 110 : 70,
                    right: 15,
                    position: 'absolute',
                    padding: 2,
                    paddingHorizontal: 6,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    this.setState({ playing: { [item.key]: false } });
                    if (Platform.OS === 'ios') {
                      this.players[item.key].presentFullscreenPlayer();
                    } else {
                      navigation.navigate('FullScreenVideo', { uri: item.url });
                    }
                  }}
                >
                  <Icon
                    name="md-expand"
                    size={30}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#fff',
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}
            {this.repCommentCount(item)}
            <View style={{ padding: 10 }}>{this.repsAndComments(item)}</View>
          </View>
        );
      default:
        return null;
    }
  }

  renderFeed() {
    const { feed, getPosts, profile } = this.props;
    const { loadMore, refreshing } = this.state;
    if (Object.values(feed).length > 0) {
      return (
        <FlatList
          data={sortPostsByDate(Object.values(feed))}
          keyExtractor={item => item.key}
          onRefresh={async () => {
            this.setState({ refreshing: true });
            await getPosts(profile.uid, 30);
            this.setState({ refreshing: false });
          }}
          // onEndReached={()=> {
          //   this.setState({fetchAmount: this.state.fetchAmount+15}, () => {
          //     this.props.getPosts(this.props.profile.uid, this.state.fetchAmount)
          //   })
          // }}
          ListFooterComponent={() => {
            const initial = Object.values(feed).length;
            if (initial > 29 && loadMore) {
              return (
                <Card>
                  <TouchableOpacity
                    style={{ alignItems: 'center', paddingVertical: 10 }}
                    onPress={() => {
                      const keys = Object.keys(feed);
                      const endAt = keys[keys.length - 1];
                      this.setState({ spinner: true }, async () => {
                        await getPosts(profile.uid, 30, endAt);
                        if (Object.values(feed).length === initial) {
                          this.setState({ loadMore: false });
                        }
                        this.setState({ spinner: false });
                      });
                    }}
                  >
                    <Text style={{ color: colors.secondary }}>Load more</Text>
                  </TouchableOpacity>
                </Card>
              );
            }
            return null;
          }}
          refreshing={refreshing}
          renderItem={({ item, index }) => {
            return (
              <>
                <AdView index={index} />
                <Card style={{ marginBottom: 10 }}>{this.renderFeedItem(item)}</Card>
              </>
            );
          }}
        />
      );
    }
    return <Text style={{ fontSize: 20, alignSelf: 'center', marginTop: 20, color: '#999' }}>No feed items yet</Text>;
  }

  render() {
    const scrollRef = React.createRef<ScrollView>();
    const {
      profile,
      friends,
      users,
      navigation,
      postStatus,
      feed,
      comment,
      getCommentRepsUsers,
      getRepsUsers,
      getReplies,
      getComments,
      onRepComment,
    } = this.props;
    const { uid, username, unreadCount, avatar } = profile;
    const {
      status,
      mentionList,
      spinner,
      selectedImage,
      showImage,
      postId,
      focusCommentInput,
      showCommentModal,
      likesModalVisible,
      repsId,
      repCount,
      selectedPost,
    } = this.state;

    const combined = { ...users, ...friends };

    const notificationsButton = (
      <TouchableOpacity onPress={() => navigation.navigate({ routeName: 'Notifications' })}>
        <View style={{ width: 30, alignItems: 'center' }}>
          <Icon name="ios-notifications" size={25} style={{ color: '#fff', marginLeft: -10 }} />
          {!!unreadCount && unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text numberOfLines={1} adjustsFontSizeToFit={unreadCount > 0} style={{ fontSize: 10, color: '#fff' }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
    return (
      <>
        <Header title="Feed" right={notificationsButton} />
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            padding: 10,
            alignItems: 'center',
            borderBottomWidth: 0.5,
            borderColor: '#999',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={{
              elevation: 4,
              shadowOffset: { width: 5, height: 5 },
              shadowColor: 'grey',
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}
          >
            {profile && avatar ? (
              <Image source={{ uri: avatar }} style={{ height: 50, width: 50, borderRadius: 25 }} />
            ) : (
              <Icon name="md-contact" size={60} style={{ color: colors.primary }} />
            )}
          </TouchableOpacity>
          <TextInput
            underlineColorAndroid="transparent"
            value={status}
            maxLength={280}
            autoCorrect={false}
            onChangeText={input => {
              this.setState({ status: input });
              const mentionFriends = Object.values(friends);
              const list = getMentionsList(input, mentionFriends);
              list ? this.setState({ mentionList: list }) : this.setState({ mentionList: null });
            }}
            placeholder="Post a status for your pals..."
            style={{
              flex: 1,
              borderColor: '#999',
              borderWidth: 0.5,
              marginHorizontal: 10,
              height: 40,
              padding: 5,
              fontFamily: 'Montserrat',
            }}
          />
          <TouchableOpacity
            onPress={() => {
              if (username) {
                this.showPicker();
              } else {
                Alert.alert('Username not set', 'You need a username before making posts, go to your profile now?', [
                  { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  { text: 'OK', onPress: () => navigation.navigate('Profile') },
                ]);
              }
            }}
          >
            <Icon
              name="ios-camera"
              size={40}
              style={{
                color: colors.secondary,
                marginLeft: 5,
                marginRight: 10,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (status) {
                if (username) {
                  Alert.alert('Confirm', 'Submit post?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: async () => {
                        try {
                          await postStatus({
                            type: PostType.STATUS,
                            text: status,
                            uid,
                            username,
                            createdAt: new Date().toString(),
                          });
                          this.setState({ status: '' });
                        } catch (e) {
                          Alert.alert('Error', e.message);
                        }
                      },
                    },
                  ]);
                } else {
                  Alert.alert('Username not set', 'You need a username before making posts, go to your profile now?', [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'OK', onPress: () => navigation.navigate('Profile') },
                  ]);
                }
              } else {
                // alert no status
              }
            }}
          >
            <Icon
              name="md-return-right"
              size={40}
              style={{
                color: colors.secondary,
                paddingTop: 5,
              }}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ backgroundColor: '#9993', flex: 1, paddingTop: 10 }}
          ref={scrollRef}
          onScroll={event => {
            this.scrollIndex = event.nativeEvent.contentOffset.y;
          }}
        >
          {mentionList && (
            <View style={styles.mentionList}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={mentionList}
                style={{ backgroundColor: '#fff' }}
                keyExtractor={item => item.uid}
                renderItem={({ item, index }) => {
                  if (index < 10) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          const split = status.split(' ');
                          split[split.length - 1] = `@${item.username} `;
                          this.setState({ status: split.join(' '), mentionList: null });
                        }}
                        style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5 }}
                      >
                        {item.avatar ? (
                          <Image source={{ uri: item.avatar }} style={{ height: 30, width: 30, borderRadius: 15 }} />
                        ) : (
                          <Icon name="md-contact" style={{ fontSize: 35, color: colors.primary }} />
                        )}
                        <Text style={{ marginLeft: 10 }}>{item.username}</Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                }}
              />
            </View>
          )}
          {friends && profile && this.renderFeed()}
        </ScrollView>
        {spinner && (
          <View style={sStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <Modal onRequestClose={() => null} visible={showImage} transparent>
          <ImageViewer
            renderIndicator={(currentIndex, allSize) => null}
            loadingRender={() => (
              <SafeAreaView>
                <Text style={{ color: '#fff', fontSize: 20 }}>Loading...</Text>
              </SafeAreaView>
            )}
            renderHeader={() => {
              return (
                <TouchableOpacity
                  style={{ position: 'absolute', top: 20, left: 10, padding: 10, zIndex: 9999 }}
                  onPress={() => this.setState({ selectedImage: null, showImage: false })}
                >
                  <View
                    style={{
                      backgroundColor: '#0007',
                      paddingHorizontal: 15,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <Icon name="ios-arrow-back" size={40} style={{ color: '#fff' }} />
                  </View>
                </TouchableOpacity>
              );
            }}
            imageUrls={selectedImage}
          />
        </Modal>
        <ModalBox
          style={{
            width: SCREEN_WIDTH - 20,
            height: SCREEN_HEIGHT - 150,
            marginTop: Platform.select({ ios: 10 }),
            borderRadius: 5,
            padding: 5,
          }}
          swipeToClose={false}
          isOpen={showCommentModal}
          onClosed={() => this.setState({ focusCommentInput: false, showCommentModal: false })}
          backButtonClose
          position="center"
          key={showCommentModal ? 1 : 2}
        >
          <TouchableOpacity onPress={() => this.setState({ showCommentModal: false })}>
            <Icon name="ios-arrow-back" size={30} style={{ color: '#000', padding: 10 }} />
          </TouchableOpacity>
          <Comments
            data={feed[postId] ? feed[postId].comments : []}
            viewingUserName={profile.username}
            deleteAction={c => console.log('delete comment')}
            initialDisplayCount={10}
            editMinuteLimit={900}
            focusCommentInput={focusCommentInput}
            childrenPerPage={5}
            // clastCommentUpdate={this.state.lastCommentUpdate}
            users={Object.values(combined)}
            usernameTapAction={(username, uid) => {
              if (uid === profile.uid) {
                navigation.navigate('Profile');
              } else {
                navigation.navigate('ProfileView', { uid });
              }
            }}
            childPropName="children"
            isChild={c => c.parentCommentId}
            parentIdExtractor={c => c.key}
            keyExtractor={item => item.comment_id}
            usernameExtractor={item => {
              if (item.uid === profile.uid) {
                return 'You';
              }
              return friends[item.uid].username || users[item.uid].username;
            }}
            uidExtractor={item => item.uid}
            editTimeExtractor={item => item.updated_at || new Date(item.created_at).toISOString()}
            createdTimeExtractor={item => new Date(item.created_at).toISOString()}
            bodyExtractor={item => item.text}
            imageExtractor={item => {
              if (item.uid === profile.uid) {
                return profile.avatar;
              }
              return friends[item.uid].avatar || users[item.uid].avatar;
            }}
            likeExtractor={item => item.rep}
            reportedExtractor={item => item.reported}
            likesExtractor={item =>
              likesExtractor(
                item,
                profile.uid,
                (id: string) => navigation.navigate('ProfileView', { uid: id }),
                () => navigation.navigate('Profile')
              )
            }
            likeCountExtractor={item => item.repCount}
            commentCount={feed[postId] ? feed[postId].commentCount : 0}
            childrenCountExtractor={c => c.childrenCount}
            timestampExtractor={item => new Date(item.created_at).toISOString()}
            replyAction={offset => {
              scrollRef.current.scrollTo({ x: null, y: this.scrollIndex + offset - 300, animated: true });
            }}
            saveAction={async (text, parentCommentId) => {
              if (text) {
                await comment(profile.uid, postId, text, new Date().toString(), parentCommentId);
              }
            }}
            editAction={(text, c) => console.log(text)}
            reportAction={c => console.log(c)}
            likeAction={c => onRepComment(c)}
            likesTapAction={(c: Comment) => {
              this.setState({ likesModalVisible: true, repsId: c.key, repCount: c.repCount });
              getRepsUsers(c.key);
            }}
            paginateAction={(fromComment: Comment, direction: string, parentComment?: Comment) => {
              if (parentComment) {
                getReplies(parentComment, 10, fromComment.key);
              } else {
                getComments(postId, 10, fromComment.key);
              }
            }}
            getCommentRepsUsers={(c, amount) => getCommentRepsUsers(c, amount)}
          />
        </ModalBox>
        <RepsModal
          onClosed={() => this.setState({ likesModalVisible: false })}
          isOpen={likesModalVisible}
          id={repsId}
          repCount={repCount}
        />
        <ActionSheet
          ref={ref => {
            this.ActionSheet = ref;
          }}
          options={['View full post', 'Report post', 'Cancel']}
          cancelButtonIndex={2}
          onPress={index => {
            if (index === 0) {
              navigation.navigate('PostView', { postId: selectedPost });
            } else if (index === 1) {
              console.log('report post');
            }
          }}
        />
      </>
    );
  }
}

const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
});

const mapDispatchToProps = dispatch => ({
  postStatus: status => dispatch(addPost(status)),
  onRepPost: item => dispatch(repPost(item)),
  comment: (uid, postId, text, created_at, parentCommentId) =>
    dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  getComments: (key: string, amount?: number, endAt?: string) => dispatch(fetchComments(key, amount, endAt)),
  onRepComment: comment => dispatch(repComment(comment)),
  getPosts: (uid, amount, endAt) => dispatch(fetchPosts(uid, amount, endAt)),
  getCommentRepsUsers: (comment, limit) => dispatch(fetchCommentRepsUsers(comment, limit)),
  getRepsUsers: (postId: string, limit?: number) => dispatch(fetchRepsUsers(postId, limit)),
  getReplies: (fromCommentId: Comment, limit: number, endAt?: string) =>
    dispatch(fetchReplies(fromCommentId, limit, endAt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
