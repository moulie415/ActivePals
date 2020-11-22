import React, {FunctionComponent, useRef, useState} from 'react';
import {
  View,
  Alert,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image as SlowImage,
} from 'react-native';
import {connect} from 'react-redux';
import ImagePicker, {ImagePickerOptions} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import Share, {Options} from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import Image from 'react-native-fast-image';
import VideoCompress from 'react-native-video-compressor';
import ActionSheet from 'react-native-actionsheet';
import styles from '../styles/homeStyles';
import sStyles from '../styles/settingsStyles';
import Comments from '../components/comments';
import {
  likesExtractor,
  getSimplifiedTime,
  getMentionsList,
  sortPostsByDate,
} from '../constants/utils';
import AdView from '../components/AdView';
import PostItem from '../components/Post/Post';
import {PostType} from '../types/Post';
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
import {
  Text,
  Card,
  Input,
  Layout,
  List,
  Divider,
  Spinner,
  Modal,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import RepIcon from '../components/RepIcon/RepIcon';
import Avatar from '../components/Avatar/Avatar';
import globalStyles from '../styles/globalStyles';
import Post from '../components/Post/Post';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_VIDEO_SIZE = 30000000; // 30mb

const Home: FunctionComponent<HomeProps> = ({
  friends,
  users,
  profile,
  navigation,
  getRepsUsers,
  getComments,
  onRepPost,
  feed,
  getPosts,
  getReplies,
  getCommentRepsUsers,
  location,
  postStatus,
  comment,
  onRepComment,
}) => {
  const actionSheetRef = useRef<ActionSheet>(null);
  const players = useRef<{[key: string]: Video}>({});
  const scrollIndex = useRef(0);
  const [spinner, setSpinner] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string}[]>([]);
  const [showImage, setShowImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [loadMore, setLoadMore] = useState(true);
  const [playing, setPlaying] = useState<{[key: string]: boolean}>({});
  const [status, setStatus] = useState('');
  const [focusCommentInput, setFocusCommentInput] = useState(false);
  const [postId, setPostId] = useState('');
  const [repsId, setRepsId] = useState('');
  const [repCount, setRepCount] = useState(0);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [mentionList, setMentionList] = useState<Profile[]>([]);
  const [selectedPost, setSelectedPost] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const showPicker = () => {
    const options: ImagePickerOptions = {
      title: '',
      mediaType: 'mixed',
      noData: true,
      storageOptions: {
        skipBackup: true,
      },
      durationLimit: 60,
      allowsEditing: true,
      takePhotoButtonTitle: 'Take photo/video',
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
      } else {
        if (response.type && response.type.includes('image')) {
          const size = 720;
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
            message: false,
            text: status,
          });
        } else {
          await processVideo(response.uri);
          setSpinner(false);
        }
      }
    });
  };

  const processVideo = async (uri: string) => {
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
        navigation.navigate('FilePreview', {
          type: 'video',
          uri,
          message: false,
          text: status,
        });
      } else {
        Alert.alert('Error', 'Sorry the file size is too large');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const renderFeed = () => {
    if (Object.values(feed).length > 0) {
      return (
        <List
          data={sortPostsByDate(Object.values(feed))}
          keyExtractor={(item) => item.key}
          onRefresh={async () => {
            setRefreshing(true);
            await getPosts(profile.uid, 30);
            setRefreshing(false);
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
                    style={{alignItems: 'center', paddingVertical: 10}}
                    onPress={async () => {
                      const keys = Object.keys(feed);
                      const endAt = keys[keys.length - 1];
                      setSpinner(true);
                      await getPosts(profile.uid, 30, endAt);
                      if (Object.values(feed).length === initial) {
                        setLoadMore(false);
                      }
                      setSpinner(false);
                    }}>
                    <Text>Load more</Text>
                  </TouchableOpacity>
                </Card>
              );
            }
            return null;
          }}
          refreshing={refreshing}
          renderItem={({item, index}) => {
            return (
              <>
                <AdView index={index} location={location} />
                <Card style={{marginBottom: 10}}>
                  <PostItem
                    item={item}
                    profile={profile}
                    navigation={navigation}
                    friends={friends}
                    users={users}
                    setLikesModalVisible={setLikesModalVisible}
                    setRepCount={setRepCount}
                    setRepsId={setRepsId}
                    getRepsUsers={getRepsUsers}
                    setPostId={setPostId}
                    setShowCommentModal={setShowCommentModal}
                    getComments={getComments}
                    setSpinner={setSpinner}
                    onRepPost={onRepPost}
                    setFocusCommentInput={setFocusCommentInput}
                    setSelectedPost={setSelectedPost}
                    actionSheetRef={actionSheetRef}
                    setShowImage={setShowImage}
                    setSelectedImage={setSelectedImage}
                    setPlaying={setPlaying}
                    players={players}
                    playing={playing}
                  />
                </Card>
              </>
            );
          }}
        />
      );
    }
    return (
      <Text
        style={{
          fontSize: 20,
          alignSelf: 'center',
          marginTop: 20,
        }}>
        No feed items yet
      </Text>
    );
  };

  const {uid, username, avatar} = profile;

  const combined = {...users, ...friends};

  return (
    <Layout style={{flex: 1}}>
      <Layout
        style={{
          flexDirection: 'row',
          padding: 10,
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {profile && avatar ? (
            <Avatar uri={avatar} size={50} />
          ) : (
            <ThemedIcon name="person" size={50} />
          )}
        </TouchableOpacity>
        <Input
          style={{flex: 1, marginHorizontal: 10, fontSize: 12}}
          value={status}
          maxLength={280}
          autoCorrect={false}
          onChangeText={(input) => {
            setStatus(input);
            const mentionFriends = Object.values(friends);
            const list = getMentionsList(input, mentionFriends);
            list ? setMentionList(list) : setMentionList([]);
          }}
          placeholder="Post a status for your pals..."
        />
        <TouchableOpacity
          onPress={() => {
            if (username) {
              showPicker();
            } else {
              Alert.alert(
                'Username not set',
                'You need a username before making posts, go to your profile now?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {text: 'OK', onPress: () => navigation.navigate('Profile')},
                ],
              );
            }
          }}>
          <ThemedIcon name="camera" size={40} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (status) {
              if (username) {
                Alert.alert('Confirm', 'Submit post?', [
                  {text: 'Cancel', style: 'cancel'},
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
                        setStatus('');
                      } catch (e) {
                        Alert.alert('Error', e.message);
                      }
                    },
                  },
                ]);
              } else {
                Alert.alert(
                  'Username not set',
                  'You need a username before making posts, go to your profile now?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Profile'),
                    },
                  ],
                );
              }
            } else {
              // alert no status
            }
          }}>
          <ThemedIcon name="corner-down-right" size={40} />
        </TouchableOpacity>
      </Layout>
      <Divider />
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingTop: 10,
        }}
        ref={scrollRef}
        onScroll={(event) => {
          scrollIndex.current = event.nativeEvent.contentOffset.y;
        }}>
        {mentionList && (
          <View style={styles.mentionList}>
            <List
              ItemSeparatorComponent={Divider}
              keyboardShouldPersistTaps="handled"
              data={mentionList}
              style={{}}
              keyExtractor={(item) => item.uid}
              renderItem={({item, index}) => {
                if (index < 10) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        const split = status.split(' ');
                        split[split.length - 1] = `@${item.username} `;
                        setStatus(split.join(' '));
                        setMentionList([]);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                      }}>
                      {item.avatar ? (
                        <Image
                          source={{uri: item.avatar}}
                          style={{height: 30, width: 30, borderRadius: 15}}
                        />
                      ) : (
                        <ThemedIcon name="person" size={35} />
                      )}
                      <Text style={{marginLeft: 10}}>{item.username}</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
            />
          </View>
        )}
        {friends && profile && renderFeed()}
      </ScrollView>
      {spinner && (
        <View style={sStyles.spinner}>
          <Spinner />
        </View>
      )}
      <Modal
        style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT}}
        visible={showImage}
        backdropStyle={globalStyles.backdrop}>
        <ImageViewer
          renderIndicator={(currentIndex, allSize) => null}
          loadingRender={() => (
            <SafeAreaView>
              <Text style={{fontSize: 20}}>Loading...</Text>
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
                    paddingHorizontal: 15,
                    paddingVertical: 2,
                    borderRadius: 10,
                  }}>
                  <ThemedIcon name="arrow-ios-back" size={40} />
                </View>
              </TouchableOpacity>
            );
          }}
          imageUrls={selectedImage}
        />
      </Modal>
      <Modal
        style={{
          width: SCREEN_WIDTH - 20,
          height: SCREEN_HEIGHT - 30,
          borderRadius: 5,
          padding: 5,
        }}
        backdropStyle={globalStyles.backdrop}
        visible={showCommentModal}
        onBackdropPress={() => {
          setFocusCommentInput(false);
          setShowCommentModal(false);
        }}>
        <Layout style={{flex: 1}}>
          <TouchableOpacity onPress={() => setShowCommentModal(false)}>
            <ThemedIcon
              name="arrow-back"
              size={30}
              style={{padding: 10, margin: 10}}
            />
          </TouchableOpacity>
          <Comments
            data={feed[postId] ? feed[postId].comments : []}
            viewingUserName={profile.username}
            deleteAction={(c) => console.log('delete comment')}
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
                (id: string) => navigation.navigate('ProfileView', {uid: id}),
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
            getCommentRepsUsers={(c, amount) => getCommentRepsUsers(c, amount)}
          />
        </Layout>
      </Modal>
      <RepsModal
        onClosed={() => setLikesModalVisible(false)}
        isOpen={likesModalVisible}
        id={repsId}
        repCount={repCount}
      />
      <ActionSheet
        ref={actionSheetRef}
        options={['View full post', 'Report post', 'Cancel']}
        cancelButtonIndex={2}
        onPress={(index: number) => {
          if (index === 0) {
            navigation.navigate('PostView', {postId: selectedPost});
          } else if (index === 1) {
            console.log('report post');
          }
        }}
      />
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
  location: profile.location,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  postStatus: (status) => dispatch(addPost(status)),
  onRepPost: (item) => dispatch(repPost(item)),
  comment: (uid, postId, text, created_at, parentCommentId) =>
    dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  getComments: (key: string, amount?: number, endAt?: string) =>
    dispatch(fetchComments(key, amount, endAt)),
  onRepComment: (comment) => dispatch(repComment(comment)),
  getPosts: (uid, amount, endAt) => dispatch(fetchPosts(uid, amount, endAt)),
  getCommentRepsUsers: (comment, limit) =>
    dispatch(fetchCommentRepsUsers(comment, limit)),
  getRepsUsers: (postId: string, limit?: number) =>
    dispatch(fetchRepsUsers(postId, limit)),
  getReplies: (fromCommentId: Comment, limit: number, endAt?: string) =>
    dispatch(fetchReplies(fromCommentId, limit, endAt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
