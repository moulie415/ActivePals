import React, {FunctionComponent, useRef, useState, useEffect} from 'react';
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
import Share, {Options} from 'react-native-share';
import Video from 'react-native-video';
import {connect} from 'react-redux';
import Image from 'react-native-fast-image';
import ParsedText from '../components/ParsedText';
import Comments from '../components/comments';
import sStyles from '../styles/settingsStyles';
import {likesExtractor, getSimplifiedTime} from '../constants/utils';
import styles from '../styles/postViewStyles';
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
import {Text, Spinner, Layout, Divider} from '@ui-kitten/components';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import RepIcon from '../components/RepIcon/RepIcon';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import Post from '../types/Post';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const PostView: FunctionComponent<PostViewProps> = ({
  getPost,
  getComments,
  getCommentRepsUsers,
  route,
  friends,
  users,
  navigation,
  profile,
  onRepComment,
  onRepPost,
  getReplies,
  getRepsUsers,
  feed,
  comment,
}) => {
  const player = useRef<Video>(null);
  const scrollIndex = useRef(0);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [commentFetchAmount, setCommentFetchAmount] = useState(10);
  const [userFetchAmount, setUserFetchAmount] = useState(10);
  const [showImage, setShowImage] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string}[]>([]);
  const [focusCommentInput, setFocusCommentInput] = useState(false);
  const [repsId, setRepsId] = useState('');
  const [repCount, setRepCount] = useState(0);
  const [spinner, setSpinner] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const {postId} = route.params;

  useEffect(() => {
    if (postId) {
      getPost(postId);
      getComments(postId);
    }
  }, [getPost, postId, getComments]);

  const getUsername = (uid: string) => {
    if (friends[uid]) {
      return friends[uid].username;
    }
    if (users[uid]) {
      return users[uid].username;
    }
    return 'N/A';
  };

  const getUsernameFormatted = (uid: string) => {
    return (
      <TouchableOpacity
        onPress={() => {
          uid !== profile.uid
            ? navigation.navigate('ProfileView', {uid})
            : navigation.navigate('Profile');
        }}>
        <Text style={{fontWeight: 'bold', flex: 1}}>
          {uid === profile.uid ? 'You' : getUsername(uid)}
        </Text>
      </TouchableOpacity>
    );
  };

  const sharePost = async (item: Post) => {
    setSpinner(true);
    const {username} = profile;
    const text = item.text ? `"${item.text}"` : '';
    const options: Options = {
      message: `${username} shared a post from ActivePals:\n ${text}`,
      title: `Share ${item.type}?`,
    };
    if (item.type === 'photo') {
      try {
        const resp = await RNFetchBlob.config({fileCache: false}).fetch(
          'GET',
          item.url,
        );
        const base64 = await resp.base64();
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        options.url = dataUrl;
      } catch (e) {
        Alert.alert('Error', 'There was a problem sharing the photo');
        setSpinner(false);
        return;
      }
    }
    try {
      await Share.open(options);
      Alert.alert('Success', 'Post Shared');
      setSpinner(false);
    } catch (e) {
      setSpinner(false);

      console.log(e);
    }
  };

  const repCommentCount = (item: Post) => {
    return (
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Divider />
        <View
          style={{
            flex: 1,
            marginVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {item.type !== 'video' && (
            <TouchableOpacity
              onPress={() => sharePost(item)}
              style={{
                flexDirection: 'row',
                paddingHorizontal: 25,
                alignItems: 'center',
              }}>
              <ThemedIcon size={25} name="share" />
              {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Share</Text> */}
            </TouchableOpacity>
          )}
          <View style={{flex: 1}}>
            <Text style={{textAlign: 'center'}}>
              {`${item.commentCount || 0} ${
                item.commentCount === 1 ? ' comment' : ' comments'
              }`}
            </Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
            <RepIcon
              onPress={() => onRepPost(item)}
              size={25}
              active={item.rep}
            />
            <View style={{flex: 1}}>
              <TouchableOpacity
                onPress={async () => {
                  setLikesModalVisible(true);
                  setRepsId(item.key);
                  setRepCount(item.repCount);
                  await getRepsUsers(item.key);
                }}>
                <Text style={{textAlign: 'center'}}>
                  {`${item.repCount || 0} ${
                    item.repCount === 1 ? ' rep' : ' reps'
                  }`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Divider />
      </View>
    );
  };

  const fetchAvatar = (uid: string) => {
    const navigate = () =>
      uid !== profile.uid
        ? navigation.navigate('ProfileView', {uid})
        : navigation.navigate('Profile');
    if (profile.avatar && uid === profile.uid) {
      return (
        <TouchableOpacity onPress={navigate}>
          <Image
            source={{uri: profile.avatar}}
            style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}
          />
        </TouchableOpacity>
      );
    }
    if (friends[uid] && friends[uid].avatar) {
      return (
        <TouchableOpacity onPress={navigate}>
          <Image
            source={{uri: friends[uid].avatar}}
            style={{height: 35, width: 35, borderRadius: 17, marginRight: 10}}
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={navigate}>
        <ThemedIcon name="person" size={45} style={{marginRight: 10}} />
      </TouchableOpacity>
    );
  };

  const renderRepsFooter = () => {
    const post = feed[postId];
    if (post && post.repCount > userFetchAmount) {
      return (
        <TouchableOpacity
          style={{alignItems: 'center'}}
          onPress={() => {
            setUserFetchAmount(userFetchAmount + 5);
            getRepsUsers(postId, userFetchAmount + 5);
          }}>
          <Text>Show more</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderPost = (item: Post) => {
    switch (item.type) {
      case 'status':
        return (
          <View style={{padding: 10, margin: 5}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {fetchAvatar(item.uid)}
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {getUsernameFormatted(item.uid)}
                  <Text>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                <Text>{item.text}</Text>
              </View>
            </View>
          </View>
        );
      case 'photo':
        return (
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                paddingBottom: 0,
              }}>
              {fetchAvatar(item.uid)}
              <View style={{flex: 1}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {getUsernameFormatted(item.uid)}
                  <Text>{getSimplifiedTime(item.createdAt)}</Text>
                </View>
                <Text>{item.text}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedImage([{url: item.url}]);
                setShowImage(true);
              }}
              style={{marginTop: 10, marginBottom: 10}}>
              <Image
                style={{width: '100%', height: SCREEN_HEIGHT / 2 - 55}}
                resizeMode="contain"
                source={{uri: item.url}}
              />
            </TouchableOpacity>
          </View>
        );
      case 'video':
        return (
          <TouchableWithoutFeedback onPress={() => setPlaying(false)}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  padding: 10,
                  paddingBottom: 0,
                  zIndex: 2,
                }}>
                {fetchAvatar(item.uid)}
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {getUsernameFormatted(item.uid)}
                    <Text>{getSimplifiedTime(item.createdAt)}</Text>
                  </View>
                  <Text>{item.text}</Text>
                </View>
              </View>
              <Video
                ref={player}
                source={{uri: item.url}}
                style={{width: '100%', height: SCREEN_HEIGHT / 2 - 55}}
                paused={!playing}
                ignoreSilentSwitch="ignore"
                repeat
                onFullscreenPlayerDidPresent={() => setPlaying(false)}
                resizeMode="contain"
                onBuffer={() => console.log('buffering')} // Callback when remote video is buffering
                onError={(e) => Alert.alert('Error', e.error.errorString)}
              />
              {!playing && (
                <View style={hStyles.playButtonContainer}>
                  <TouchableOpacity onPress={() => setPlaying(true)}>
                    <ThemedIcon
                      name="play-circle"
                      size={50}
                      style={{
                        backgroundColor: 'transparent',
                        opacity: 0.8,
                      }}
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
                      setPlaying(true);
                      if (Platform.OS === 'ios') {
                        player.current?.presentFullscreenPlayer();
                      } else {
                        navigation.navigate('FullScreenVideo', {uri: item.url});
                      }
                    }}>
                    <ThemedIcon
                      name="expand"
                      size={30}
                      style={{backgroundColor: 'transparent'}}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        );
      default:
        return null;
    }
  };

  const combined = {...users, ...friends};

  const post = feed[postId];
  const comments = post && post.comments ? post.comments : [];

  return post ? (
    <Layout style={{flex: 1}}>
      <KeyboardAvoidingView
        contentContainerStyle={{flex: 1}}
        style={{flex: 1}}
        behavior={post && post.type === 'status' ? 'padding' : 'position'}>
        <ScrollView
          ref={scrollRef}
          onScroll={(event) => {
            scrollIndex.current = event.nativeEvent.contentOffset.y;
          }}
          style={styles.container}>
          {post && <View>{renderPost(post)}</View>}
          {post && repCommentCount(post)}
          {post && (
            <SafeAreaView>
              <Comments
                data={comments}
                viewingUserName={profile.username}
                deleteAction={(c) => console.log('delete comment')}
                initialDisplayCount={10}
                editMinuteLimit={900}
                focusCommentInput={focusCommentInput}
                childrenPerPage={5}
                // clastCommentUpdate={state.lastCommentUpdate}
                users={Object.values(combined)}
                usernameTapAction={(username, uid) => {
                  if (uid === profile.uid) {
                    navigation.navigate('Profile');
                  } else {
                    navigation.navigate('ProfileView', {uid});
                  }
                }}
                childPropName="children"
                isChild={(c) => c.parentCommentId}
                parentIdExtractor={(c) => c.key}
                keyExtractor={(item) => item.comment_id}
                usernameExtractor={(item) => {
                  if (item.uid === profile.uid) {
                    return 'You';
                  }
                  return friends[item.uid].username || users[item.uid].username;
                }}
                uidExtractor={(item) => item.uid}
                editTimeExtractor={(item) =>
                  item.updated_at || new Date(item.created_at).toISOString()
                }
                createdTimeExtractor={(item) =>
                  new Date(item.created_at).toISOString()
                }
                bodyExtractor={(item) => item.text}
                imageExtractor={(item) => {
                  if (item.uid === profile.uid) {
                    return profile.avatar;
                  }
                  return friends[item.uid].avatar || users[item.uid].avatar;
                }}
                likeExtractor={(item) => item.rep}
                reportedExtractor={(item) => item.reported}
                likesExtractor={(item) =>
                  likesExtractor(
                    item,
                    profile.uid,
                    (id: string) =>
                      navigation.navigate('ProfileView', {uid: id}),
                    () => navigation.navigate('Profile'),
                  )
                }
                likeCountExtractor={(item) => item.repCount}
                commentCount={feed[postId] ? feed[postId].commentCount : 0}
                childrenCountExtractor={(c) => c.childrenCount}
                timestampExtractor={(item) =>
                  new Date(item.created_at).toISOString()
                }
                replyAction={(offset) => {
                  scrollRef.current?.scrollTo({
                    y: scrollIndex.current + offset - 300,
                    animated: true,
                  });
                }}
                saveAction={async (text, parentCommentId) => {
                  if (text) {
                    await comment(
                      profile.uid,
                      postId,
                      text,
                      new Date().toString(),
                      parentCommentId,
                    );
                  }
                }}
                editAction={(text, c) => console.log(text)}
                reportAction={(c) => console.log(c)}
                likeAction={(c) => onRepComment(c)}
                likesTapAction={(c: Comment) => {
                  setLikesModalVisible(true);
                  setRepsId(c.key);
                  setRepCount(c.repCount);
                  getRepsUsers(c.key);
                }}
                paginateAction={(
                  fromComment: Comment,
                  direction: string,
                  parentComment?: Comment,
                ) => {
                  if (parentComment) {
                    getReplies(parentComment, 10, fromComment.key);
                  } else {
                    getComments(postId, 10, fromComment.key);
                  }
                }}
                getCommentRepsUsers={(c, amount) =>
                  getCommentRepsUsers(c, amount)
                }
              />
            </SafeAreaView>
          )}
          <RepsModal
            onClosed={() => setLikesModalVisible(false)}
            isOpen={likesModalVisible}
            id={repsId}
            repCount={repCount}
            navigation={navigation}
          />
          <Modal onRequestClose={() => null} visible={showImage} transparent>
            <ImageViewer
              renderIndicator={(currentIndex, allSize) => null}
              loadingRender={() => (
                <SafeAreaView>
                  <Text>Loading...</Text>
                </SafeAreaView>
              )}
              renderHeader={() => {
                return (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 10,
                      padding: 10,
                      zIndex: 9999,
                    }}
                    onPress={() => {
                      setSelectedImage([]);
                      setShowImage(false);
                    }}>
                    <View
                      style={{
                        backgroundColor: '#0007',
                        paddingHorizontal: 15,
                        paddingVertical: 2,
                        borderRadius: 10,
                      }}>
                      <ThemedIcon
                        size={40}
                        name="arrow-ios-back"
                        style={{color: '#fff'}}
                      />
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
            <Spinner />
          </View>
        )}
      </KeyboardAvoidingView>
    </Layout>
  ) : (
    <Layout style={sStyles.spinner}>
      <Spinner />
    </Layout>
  );
};

const mapStateToProps = ({
  profile,
  home,
  friends,
  sharedInfo,
}: MyRootState) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  onRepPost: (item: Post) => dispatch(repPost(item)),
  comment: (
    uid: string,
    postId: string,
    text: string,
    created_at: string,
    parentCommentId: string,
  ) => dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  onRepComment: (comment: Comment) => dispatch(repComment(comment)),
  getComments: (key: string, amount?: number, endAt?: string) =>
    dispatch(fetchComments(key, amount, endAt)),
  getCommentRepsUsers: (comment: Comment, limit?: number) =>
    dispatch(fetchCommentRepsUsers(comment, limit)),
  getPost: (key: string) => dispatch(fetchPost(key)),
  getRepsUsers: (postId: string, limit?: number) =>
    dispatch(fetchRepsUsers(postId, limit)),
  getReplies: (fromCommentId: Comment, limit: number, endAt?: string) =>
    dispatch(fetchReplies(fromCommentId, limit, endAt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PostView);
