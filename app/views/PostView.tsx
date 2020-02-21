import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  View,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image as SlowImage,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import Share, { Options } from 'react-native-share';
import Video from 'react-native-video';
import { connect } from 'react-redux';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import ParsedText from '../components/ParsedText';
import Text from '../components/Text';
import colors from '../constants/colors';
import Comments from '../components/comments';
import sStyles from '../styles/settingsStyles';
import { likesExtractor, getSimplifiedTime } from '../constants/utils';
import styles from '../styles/postViewStyles';
import Header from '../components/Header/header';
import hStyles from '../styles/homeStyles';
import PostViewProps from '../types/views/PostView';
import {
  fetchComments,
  fetchCommentRepsUsers,
  postComment,
  repPost,
  repComment,
  fetchPost,
  fetchRepsUsers,
  fetchReplies,
} from '../actions/home';
import RepsModal from '../components/RepsModal';
import Comment from '../types/Comment';

const weightUp = require('../../assets/images/weightlifting_up.png');

const weightDown = require('../../assets/images/weightlifting_down.png');

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface State {
  likesModalVisible: boolean;
  commentFetchAmount: number;
  userFetchAmount: number;
  showImage: boolean;
  playing?: boolean;
  selectedImage?: { url: string }[];
  focusCommentInput?: boolean;
  repsId: string;
  repCount: number;
  spinner?: boolean;
}
class PostView extends Component<PostViewProps, State> {
  player: Video;

  scrollIndex: number;

  constructor(props) {
    super(props);
    this.scrollIndex = 0;
    this.state = {
      likesModalVisible: false,
      commentFetchAmount: 10,
      userFetchAmount: 10,
      showImage: false,
      repsId: '',
      repCount: 0,
    };
  }

  async componentDidMount() {
    const { getPost, getComments, navigation } = this.props;
    const { postId } = navigation.state.params;
    await getPost(postId);
    getComments(postId);
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
  };

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

  repCommentCount(item) {
    const { onRepPost, getRepsUsers } = this.props;
    return (
      <View style={{ flexDirection: 'row', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#999' }}>
        <View style={{ flex: 1, marginVertical: 10, flexDirection: 'row', alignItems: 'center' }}>
          {item.type !== 'video' && (
            <TouchableOpacity
              onPress={() => this.sharePost(item)}
              style={{ flexDirection: 'row', paddingHorizontal: 25, alignItems: 'center' }}
            >
              <Icon size={25} style={{ color: colors.postIcon }} name="md-share" />
              {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Share</Text> */}
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#999', textAlign: 'center' }}>
              {`${item.commentCount || 0} ${item.commentCount === 1 ? ' comment' : ' comments'}`}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onRepPost(item)}>
              <SlowImage
                source={item.rep ? weightUp : weightDown}
                style={{ width: 25, height: 25, tintColor: item.rep ? colors.secondary : '#616770' }}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={async () => {
                  this.setState({ likesModalVisible: true, repsId: item.key, repCount: item.repCount });
                  await getRepsUsers(item.key);
                }}
              >
                <Text style={{ color: '#999', textAlign: 'center' }}>
                  {`${item.repCount || 0} ${item.repCount === 1 ? ' rep' : ' reps'}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  fetchAvatar(uid) {
    const { profile, friends, navigation } = this.props;
    const navigate = () =>
      uid !== profile.uid ? navigation.navigate('ProfileView', { uid }) : navigation.navigate('Profile');
    if (profile.avatar && uid === profile.uid) {
      return (
        <TouchableOpacity onPress={navigate}>
          <Image
            source={{ uri: profile.avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    }
    if (friends[uid] && friends[uid].avatar) {
      return (
        <TouchableOpacity onPress={navigate}>
          <Image
            source={{ uri: friends[uid].avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={navigate}>
        <Icon name="md-contact" size={45} style={{ color: colors.primary, marginRight: 10 }} />
      </TouchableOpacity>
    );
  }

  renderRepsFooter() {
    const { userFetchAmount } = this.state;
    const { getRepsUsers, navigation, feed } = this.props;
    const { postId } = navigation.state.params;
    const post = feed[postId];
    if (post && post.repCount > userFetchAmount) {
      return (
        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={() => {
            this.setState({ userFetchAmount: userFetchAmount + 5 }, () => {
              getRepsUsers(postId, userFetchAmount);
            });
          }}
        >
          <Text style={{ color: colors.secondary }}>Show more</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }

  renderPost(item) {
    const { playing } = this.state;
    const { navigation } = this.props;
    switch (item.type) {
      case 'status':
        return (
          <View style={{ padding: 10, margin: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {this.fetchAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {this.getUsernameFormatted(item.uid)}
                  <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                <ParsedText text={item.text} />
              </View>
            </View>
          </View>
        );
      case 'photo':
        return (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, paddingBottom: 0 }}>
              {this.fetchAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {this.getUsernameFormatted(item.uid)}
                  <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                <ParsedText text={item.text} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => this.setState({ selectedImage: [{ url: item.url }], showImage: true })}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <Image
                style={{ width: '100%', height: SCREEN_HEIGHT / 2 - 55 }}
                resizeMode="contain"
                source={{ uri: item.url }}
              />
            </TouchableOpacity>
          </View>
        );
      case 'video':
        return (
          <TouchableWithoutFeedback onPress={() => this.setState({ playing: false })}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  padding: 10,
                  paddingBottom: 0,
                  zIndex: 2,
                }}
              >
                {this.fetchAvatar(item.uid)}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {this.getUsernameFormatted(item.uid)}
                    <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
                  </View>
                  <ParsedText text={item.text} />
                </View>
              </View>
              <Video
                ref={ref => {
                  this.player = ref;
                }}
                source={{ uri: item.url }}
                style={{ width: '100%', height: SCREEN_HEIGHT / 2 - 55 }}
                paused={!playing}
                ignoreSilentSwitch="ignore"
                repeat
                onFullscreenPlayerDidPresent={() => this.setState({ playing: false })}
                resizeMode="contain"
                onBuffer={() => console.log('buffering')} // Callback when remote video is buffering
                onError={e => Alert.alert('Error', e.error.errorString)}
              />
              {!playing && (
                <View style={hStyles.playButtonContainer}>
                  <TouchableOpacity onPress={() => this.setState({ playing: true })}>
                    <Icon
                      name="md-play"
                      size={50}
                      style={{ color: '#fff', backgroundColor: 'transparent', opacity: 0.8 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      bottom: 20,
                      right: 15,
                      position: 'absolute',
                      padding: 2,
                      paddingHorizontal: 6,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: 5,
                    }}
                    onPress={() => {
                      this.setState({ playing: false });
                      if (Platform.OS === 'ios') {
                        this.player.presentFullscreenPlayer();
                      } else {
                        navigation.navigate('FullScreenVideo', { uri: item.url });
                      }
                    }}
                  >
                    <Icon name="md-expand" size={30} style={{ backgroundColor: 'transparent', color: '#fff' }} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        );
      default:
        return null;
    }
  }

  render() {
    const {
      users,
      friends,
      profile,
      comment,
      navigation,
      getComments,
      getCommentRepsUsers,
      onRepComment,
      getRepsUsers,
      getReplies,
      feed,
    } = this.props;
    const combined = { ...users, ...friends };
    const {
      commentFetchAmount,
      selectedImage,
      likesModalVisible,
      showImage,
      focusCommentInput,
      repCount,
      repsId,
      spinner,
    } = this.state;
    const { postId } = navigation.state.params;
    const post = feed[postId];
    const comments = post && post.comments ? post.comments : [];
    const scrollRef = React.createRef<ScrollView>();
    return post ? (
      <KeyboardAvoidingView
        contentContainerStyle={{ flex: 1 }}
        style={{ flex: 1 }}
        behavior={post && post.type === 'status' ? 'padding' : 'position'}
      >
        <Header hasBack />
        <ScrollView
          ref={scrollRef}
          onScroll={event => {
            this.scrollIndex = event.nativeEvent.contentOffset.y;
          }}
          style={styles.container}
        >
          {post && <View>{this.renderPost(post)}</View>}
          {post && this.repCommentCount(post)}
          {post && (
            <SafeAreaView>
              <Comments
                data={comments}
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
            </SafeAreaView>
          )}
          <RepsModal
            onClosed={() => this.setState({ likesModalVisible: false })}
            isOpen={likesModalVisible}
            id={repsId}
            repCount={repCount}
          />
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
                      <Icon size={40} name="ios-arrow-back" style={{ color: '#fff' }} />
                    </View>
                  </TouchableOpacity>
                );
              }}
              imageUrls={selectedImage}
            />
          </Modal>
        </ScrollView>
        {spinner && (
          <View style={sStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
      </KeyboardAvoidingView>
    ) : (
      <View style={sStyles.spinner}>
        <PulseIndicator color={colors.secondary} />
      </View>
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
  onRepPost: item => dispatch(repPost(item)),
  comment: (uid, postId, text, created_at, parentCommentId) =>
    dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  onRepComment: comment => dispatch(repComment(comment)),
  getComments: (key: string, amount?: number, endAt?: string) => dispatch(fetchComments(key, amount, endAt)),
  getCommentRepsUsers: (comment, limit) => dispatch(fetchCommentRepsUsers(comment, limit)),
  getPost: key => dispatch(fetchPost(key)),
  getRepsUsers: (postId, limit) => dispatch(fetchRepsUsers(postId, limit)),
  getReplies: (fromCommentId: Comment, limit: number, endAt?: string) =>
    dispatch(fetchReplies(fromCommentId, limit, endAt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostView);
