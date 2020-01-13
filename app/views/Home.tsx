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
} from 'react-native';
import Card from '../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';
import { PulseIndicator } from 'react-native-indicators';
import firebase from 'react-native-firebase';
import colors from '../constants/colors';
import styles from '../styles/homeStyles';
import sStyles from '../styles/settingsStyles';
import cStyles from '../components/comments/styles';
import Text, { globalTextStyle } from '../components/Text';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalBox from 'react-native-modalbox';
import Comments from '../components/comments';
import Image from 'react-native-fast-image';
import { Image as SlowImage } from 'react-native';
import Header from '../components/Header/header';
import { likesExtractor, getSimplifiedTime, getMentionsList } from '../constants/utils';
import ParsedText from '../components/ParsedText';
import Video from 'react-native-video';
import RNFetchBlob, { RNFetchBlobStat } from 'rn-fetch-blob';
import AdView from '../components/AdView';
import Share, { Options } from 'react-native-share';
import Post, { PostType } from '../types/Post';
import HomeProps from '../types/views/Home';
import RepsModal from '../components/RepsModal';

const weightUp = require('../../assets/images/weightlifting_up.png');
const weightDown = require('../../assets/images/weightlifting_down.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MAX_VIDEO_SIZE = 30000000; //30mb

interface State {
  spinner: boolean;
  selectedImage?: { url: string }[];
  showImage: boolean;
  userFetchAmount: number;
  refreshing: boolean;
  likesModalVisible: boolean;
  loadMore: boolean;
  paused: boolean;
  playing: { [key: string]: boolean };
  status?: string;
  focusCommentInput?: boolean;
  postId: string;
  repsId: string;
  repCount: number;
  showCommentModal: boolean;
  mentionList: Profile[]
}
export class Home extends Component<HomeProps, State> {
  players: object;
  scrollIndex: number;
  input: TextInput;
  static navigationOptions = {
    header: null,
    tabBarLabel: 'Home',
    tabBarIcon: ({ tintColor }) => <Icon name="md-home" size={25} style={{ color: tintColor }} />,
  };

  constructor(props) {
    super(props);
    this.players = {};
    this.scrollIndex = 0;
    this.state = {
      spinner: false,
      selectedImage: null,
      showImage: false,
      userFetchAmount: 10,
      refreshing: false,
      likesModalVisible: false,
      loadMore: true,
      paused: true,
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

  sortByDate(array: Post[]) {
    return array.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  render() {
    const scrollRef = React.createRef<ScrollView>();
    const { uid, username, unreadCount } = this.props.profile;
    let combined = { ...this.props.users, ...this.props.friends };
    return (
      <>
        <Header
          title={'Feed'}
          right={
            <TouchableOpacity
              onPress={() => {
                this.props.onNotificationPress();
              }}
            >
              {/*<Icon name='ios-notifications' style={{color: '#fff', marginRight: 10}}/>*/}
              <View style={{ width: 30, alignItems: 'center' }}>
                <Icon name="ios-notifications" size={25} style={{ color: '#fff', marginLeft: -10 }} />
                {!!unreadCount && unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={unreadCount > 0}
                      style={{ fontSize: 10, color: '#fff' }}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          }
        />
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
            onPress={() => this.props.goToProfile()}
            style={{
              elevation: 4,
              shadowOffset: { width: 5, height: 5 },
              shadowColor: 'grey',
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}
          >
            {this.props.profile && this.props.profile.avatar ? (
              <Image source={{ uri: this.props.profile.avatar }} style={{ height: 50, width: 50, borderRadius: 25 }} />
            ) : (
              <Icon name="md-contact" size={60} style={{ color: colors.primary }} />
            )}
          </TouchableOpacity>
          <TextInput
            ref={ref => (this.input = ref)}
            underlineColorAndroid={'transparent'}
            value={this.state.status}
            maxLength={280}
            autoCorrect={false}
            onChangeText={status => {
              this.setState({ status });
              const friends = Object.values(this.props.friends);
              const list = getMentionsList(status, friends);
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
                  { text: 'OK', onPress: () => this.props.goToProfile() },
                ]);
              }
            }}
          >
            <Icon
              name="ios-attach"
              size={40}
              style={{
                color: colors.secondary,
                marginLeft: 5,
                marginRight: 10,
                // elevation:4,
                // shadowOffset: { width: 5, height: 5 },
                // shadowColor: "grey",
                // shadowOpacity: 0.5,
                // shadowRadius: 10,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (this.state.status) {
                if (username) {
                  Alert.alert('Confirm', 'Submit post?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Yes',
                      onPress: async () => {
                        try {
                          await this.props
                            .postStatus({
                              type: PostType.STATUS,
                              text: this.state.status,
                              uid,
                              username,
                              createdAt: new Date().toString(),
                            })
                          this.setState({ status: '' });
                        } catch(e) {
                          Alert.alert('Error', e.message);
                        }
                      },
                    },
                  ]);
                } else {
                  Alert.alert('Username not set', 'You need a username before making posts, go to your profile now?', [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'OK', onPress: () => this.props.goToProfile() },
                  ]);
                }
              } else {
                //alert no status
              }
            }}
          >
            <Icon
              name="md-return-right"
              size={40}
              style={{
                color: colors.secondary,
                paddingTop: 5,
                // elevation:4,
                // shadowOffset: { width: 5, height: 5 },
                // shadowColor: "grey",
                // shadowOpacity: 0.5,
                // shadowRadius: 10,
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
          {this.state.mentionList && (
            <View style={styles.mentionList}>
              <FlatList
                keyboardShouldPersistTaps={'handled'}
                data={this.state.mentionList}
                style={{ backgroundColor: '#fff' }}
                keyExtractor={item => item.uid}
                renderItem={({ item, index }) => {
                  if (index < 10) {
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          let split = this.state.status.split(' ');
                          split[split.length - 1] = '@' + item.username + ' ';
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
          {this.props.friends && this.props.profile && this.renderFeed()}
        </ScrollView>
        {this.state.spinner && (
          <View style={sStyles.spinner}>
            <PulseIndicator color={colors.secondary} />
          </View>
        )}
        <Modal onRequestClose={() => null} visible={this.state.showImage} transparent={true}>
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
                    <Icon name={'ios-arrow-back'} size={40} style={{ color: '#fff' }} />
                  </View>
                </TouchableOpacity>
              );
            }}
            imageUrls={this.state.selectedImage}
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
          isOpen={this.state.showCommentModal}
          onClosed={() => this.setState({ focusCommentInput: false, showCommentModal: false })}
          backButtonClose={true}
          position={'center'}
        >
          <TouchableOpacity onPress={() => this.setState({ showCommentModal: false })}>
            <Icon name={'ios-arrow-back'} size={30} style={{ color: '#000', padding: 10 }} />
          </TouchableOpacity>
          <Comments
            data={
              this.props.feed[this.state.postId]
                ? this.props.feed[this.state.postId].comments
                : []
            }
            viewingUserName={this.props.profile.username}
            initialDisplayCount={10}
            editMinuteLimit={900}
            focusCommentInput={this.state.focusCommentInput}
            childrenPerPage={5}
            //lastCommentUpdate={this.state.lastCommentUpdate}
            users={Object.values(combined)}
            usernameTapAction={(username, uid) => {
              if (uid == this.props.profile.uid) {
                this.props.goToProfile();
              } else {
                this.props.viewProfile(uid);
              }
            }}
            childPropName={'children'}
            isChild={comment => comment.parentCommentId}
            parentIdExtractor={comment => comment.key}
            keyExtractor={item => item.comment_id}
            usernameExtractor={item => {
              if (item.uid === this.props.profile.uid) {
                return 'You';
              } else {
                return this.props.friends[item.uid].username || this.props.users[item.uid].username;
              }
            }}
            uidExtractor={item => (item.user ? item.user.uid : null)}
            editTimeExtractor={item => item.updated_at || new Date(item.created_at).toISOString()}
            createdTimeExtractor={item => new Date(item.created_at).toISOString()}
            bodyExtractor={item => item.text}
            imageExtractor={item => {
              if (item.uid === this.props.profile.uid) {
                return this.props.profile.avatar;
              } else {
                return this.props.friends[item.uid].avatar || this.props.users[item.uid].avatar;
              }
            }}
            likeExtractor={item => item.rep}
            reportedExtractor={item => item.reported}
            likesExtractor={item =>
              likesExtractor(item, this.props.profile.uid, this.props.viewProfile, this.props.goToProfile)
            }
            likeCountExtractor={item => item.repCount}
            commentCount={this.props.feed[this.state.postId] ? this.props.feed[this.state.postId].commentCount : 0}
            childrenCountExtractor={comment => comment.childrenCount}
            timestampExtractor={item => new Date(item.created_at).toISOString()}
            replyAction={offset => {
              scrollRef.current.scrollTo({ x: null, y: this.scrollIndex + offset - 300, animated: true });
            }}
            saveAction={async (text, parentCommentId) => {
              if (text) {
                try {
                await this.props
                  .comment(this.props.profile.uid, this.state.postId, text, new Date().toString(), parentCommentId)
                } catch(e) {
                  Alert.alert('Error', e.message)
                }
              }
            }}
            editAction={(text, comment) => {
              console.log(text);
            }}
            reportAction={comment => {
              console.log(comment);
            }}
            likeAction={comment => {
              this.props.repComment(comment);
            }}
            likesTapAction={(comment: Comment) => {
              this.setState({ likesModalVisible: true, repsId: comment.key, repCount: comment.repCount });
              this.props.getRepsUsers(comment.key)
            }}
            paginateAction={(fromComment: Comment, direction: string, parentComment: Comment | undefined) => {
              if (parentComment) {
                this.props.getReplies(parentComment, 10, fromComment.key);
              } else {
                this.props.getComments(this.state.postId, 10, fromComment.key);
              }
            }}
            getCommentRepsUsers={(comment, amount) => this.props.getCommentRepsUsers(comment, amount)}
          />
        </ModalBox>
        <RepsModal
          onClosed={() => this.setState({ likesModalVisible: false })}
          isOpen={this.state.likesModalVisible}
          id={this.state.repsId}
          repCount={this.state.repCount}
        />
      </>
    );
  }

  renderFeed() {
    const { feed } = this.props;
    if (Object.values(feed).length > 0) {
      return (
        <FlatList
          data={this.sortByDate(Object.values(feed))}
          keyExtractor={item => item.key}
          onRefresh={async () => {
            this.setState({ refreshing: true });
            this.props.getFriends();
            this.props.getProfile();
            await this.props.getPosts(this.props.profile.uid, 30)
            this.setState({ refreshing: false });
          }}
          // onEndReached={()=> {
          //   this.setState({fetchAmount: this.state.fetchAmount+15}, () => {
          //     this.props.getPosts(this.props.profile.uid, this.state.fetchAmount)
          //   })
          // }}
          ListFooterComponent={() => {
            const initial = Object.values(feed).length;
            if (initial > 29 && this.state.loadMore) {
              return (
                <Card>
                  <TouchableOpacity
                    style={{ alignItems: 'center', paddingVertical: 10 }}
                    onPress={() => {
                      const keys = Object.keys(feed);
                      const endAt = keys[keys.length - 1];
                      this.setState({ spinner: true }, async () => {
                        await this.props.getPosts(this.props.profile.uid, 30, endAt)
                        if (Object.values(feed).length == initial) {
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
            } else return null;
          }}
          refreshing={this.state.refreshing}
          renderItem={({ item, index }) => {
            return (
              <View>
                <AdView index={index} />
                <Card style={{ marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => this.props.viewPost(item.key)}
                    style={{ alignSelf: 'flex-end' }}
                  ></TouchableOpacity>
                  {this.renderFeedItem(item)}
                </Card>
              </View>
            );
          }}
        />
      );
    } else
      return <Text style={{ fontSize: 20, alignSelf: 'center', marginTop: 20, color: '#999' }}>No feed items yet</Text>;
  }

  renderFeedItem(item) {
    switch (item.type) {
      case PostType.STATUS:
        return (
          <View style={{ padding: 10, margin: 5 }}>
            <View style={{ flexDirection: 'row', flex: 1, marginBottom: 10 }}>
              {this.fetchAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity>
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 5 }}>
              <ParsedText text={item.text} />
            </View>
            {this.repCommentCount(item)}
            {this.repsAndComments(item)}
          </View>
        );
      case PostType.PHOTO:
        return (
          <View>
            <View style={{ flexDirection: 'row', flex: 1, padding: 10 }}>
              {this.fetchAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity>
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 5 }}>
              <ParsedText text={item.text} />
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.setState({ selectedImage: [{ url: item.url }], showImage: true })}
              style={{ marginTop: 10, marginBottom: 10 }}
            >
              <Image style={{ width: '100%', height: 400 }} resizeMode={'cover'} source={{ uri: item.url }} />
            </TouchableOpacity>
            {this.repCommentCount(item)}
            <View style={{ padding: 10 }}>{this.repsAndComments(item)}</View>
          </View>
        );
      case PostType.VIDEO:
        return (
          <View>
            <View style={{ flexDirection: 'row', flex: 1, padding: 10, zIndex: 2 }}>
              {this.fetchAvatar(item.uid)}
              <View style={{ flex: 1 }}>
                {this.getUsernameFormatted(item.uid)}
                <Text style={{ color: '#999' }}>{getSimplifiedTime(item.createdAt)}</Text>
              </View>
              <TouchableOpacity>
                <Icon style={{ paddingHorizontal: 10 }} name="ios-more" size={20} />
              </TouchableOpacity>
            </View>
            <ParsedText style={{ marginVertical: 10 }} text={item.text} />
            <TouchableWithoutFeedback
              onPress={() => {
                this.setState({ playing: { [item.uid]: false } });
              }}
            >
              <Video
                ref={ref => (this.players[item.key] = ref)}
                source={{ uri: item.url }}
                style={{ width: '100%', height: 400 }}
                paused={!this.state.playing[item.key]}
                ignoreSilentSwitch="ignore"
                repeat={true}
                onFullscreenPlayerDidPresent={() => this.setState({ playing: { [item.key]: false } })}
                resizeMode="cover"
                onBuffer={() => {
                  console.log('buffering');
                }} // Callback when remote video is buffering
                onError={e => {
                  if (e.error && e.error.code) {
                    Alert.alert('Error', 'code ' + e.error.code + '\n' + e.error.domain);
                  } else if (e.message) {
                    Alert.alert('Error', e.message);
                  } else Alert.alert('Error', 'Error playing video');
                }}
              />
            </TouchableWithoutFeedback>
            {!this.state.playing[item.key] && (
              <View style={styles.playButtonContainer}>
                <TouchableOpacity onPress={() => this.setState({ playing: { [item.key]: true } })}>
                  <Icon
                    size={50}
                    name={'md-play'}
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
                    if (Platform.OS == 'ios') {
                      this.players[item.key].presentFullscreenPlayer();
                    } else {
                      this.props.navigateFullScreenVideo(item.url);
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
    }
  }

  repCommentCount(item) {
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
                  await this.props.getRepsUsers(item.key);
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
                  this.props.getComments(item.key);
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
    } else return <View style={{ borderTopWidth: 0.5, borderTopColor: '#999', marginVertical: 5 }} />;
  }

  repsAndComments(item) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {item.type != 'video' && (
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
          onPress={() => {
            this.props.onRepPost(item);
          }}
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
            this.props.getComments(item.key);
          }}
          style={{ flexDirection: 'row', paddingHorizontal: 25, alignItems: 'center' }}
        >
          <Icon name="md-chatboxes" size={25} style={{ color: colors.postIcon }} />
          {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Comment</Text> */}
        </TouchableOpacity>
      </View>
    );
  }

  fetchAvatar(uid) {
    if (this.props.profile.avatar && uid == this.props.profile.uid) {
      return (
        <TouchableOpacity
          onPress={() => (uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile())}
        >
          <Image
            source={{ uri: this.props.profile.avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    } else if (this.props.friends[uid] && this.props.friends[uid].avatar) {
      return (
        <TouchableOpacity
          onPress={() => (uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile())}
        >
          <Image
            source={{ uri: this.props.friends[uid].avatar }}
            style={{ height: 35, width: 35, borderRadius: 17, marginRight: 10 }}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => (uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile())}
        >
          <Icon name="md-contact" style={{ fontSize: 45, color: colors.primary, marginRight: 10 }} />
        </TouchableOpacity>
      );
    }
  }

  getUsernameFormatted(uid) {
    return (
      <TouchableOpacity
        onPress={() => {
          uid != this.props.profile.uid ? this.props.viewProfile(uid) : this.props.goToProfile();
        }}
      >
        <Text style={{ fontWeight: 'bold', color: colors.secondary, flex: 1 }}>
          {uid == this.props.profile.uid ? 'You' : this.getUsername(uid)}
        </Text>
      </TouchableOpacity>
    );
  }

  showPicker() {
    const videoOptions: ImagePickerOptions = {
      mediaType: 'video',
      durationLimit: 30,
      videoQuality: Platform.OS == 'ios' ? 'medium' : 'low',
    };
    const options: ImagePickerOptions = {
      title: null,
      mediaType: 'photo',
      customButtons: [
        { name: 'video', title: 'Shoot video...' },
        { name: 'uploadVideo', title: 'Choose video from library...' },
      ],
      noData: true,
      storageOptions: {
        skipBackup: true,
      },
    };
    ImagePicker.showImagePicker(options, response => {
      this.setState({ spinner: true });
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
        this.setState({ spinner: false });
      } else if (response.error) {
        Alert.alert('Error', response.error);
        this.setState({ spinner: false });
      } else if (response.customButton) {
        if (response.customButton == 'uploadVideo') {
          ImagePicker.launchImageLibrary(videoOptions, response => {
            this.setState({ spinner: false });
            if (response.error) {
              Alert.alert('Error', response.error);
            } else if (response.uri) {
              this.processVideo(response.uri);
            }
          });
        } else if (response.customButton == 'video') {
          ImagePicker.launchCamera(videoOptions, response => {
            this.setState({ spinner: false });
            if (response.error) {
              Alert.alert('Error', response.error);
            } else if (response.uri) {
              this.processVideo(response.uri);
            }
          });
        }
      } else {
        const size = 720;
        ImageResizer.createResizedImage(response.uri, size, size, 'JPEG', 100)
          .then(resized => {
            this.setState({ spinner: false });
            this.props.previewFile('image', resized.uri, false, this.state.status);
          })
          .catch(e => {
            Alert.alert('Error', e.message);
            this.setState({ spinner: false });
          });
      }
    });
  }

  processVideo(uri) {
    const statURI = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    //if (Platform.OS == 'ios') {
    //TODO android needs compressing
    RNFetchBlob.fs
      .stat(statURI)
      .then(stats => {
        console.log(stats);
        if (parseInt(stats.size) < MAX_VIDEO_SIZE) {
          this.props.previewFile('video', uri, false, this.state.status);
        } else {
          Alert.alert('Error', 'Sorry the file size is too large');
        }
      })
      .catch(err => {
        Alert.alert('Error', err.message);
      });
    // }
  }

  getUsername(uid) {
    if (this.props.friends[uid]) {
      return this.props.friends[uid].username;
    } else if (this.props.users[uid]) {
      return this.props.users[uid].username;
    } else return 'N/A';
  }

  renderRep(l) {
    let like = l.item;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ likesModalVisible: false });
          like.user_id == this.props.profile.uid ? this.props.goToProfile() : this.props.viewProfile(like.user_id);
        }}
        style={cStyles.likeButton}
        key={like.user_id + ''}
      >
        <View style={[cStyles.likeContainer]}>
          {like.image ? (
            <Image style={[cStyles.likeImage]} source={{ uri: like.image }} />
          ) : (
            <Icon name="md-contact" style={{ fontSize: 40, color: colors.primary }} />
          )}
          <Text>{like.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  async sharePost(item) {
    this.setState({ spinner: true });
    const username = this.props.profile.username;
    const options: Options = {
      message: `${username} shared a post from ActivePals:\n ${item.text ? '"' + item.text + '"' : ''}`,
      title: `Share ${item.type}?`,
    };
    if (item.type == 'photo') {
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
}

import { connect } from 'react-redux';
import {
  navigateProfile,
  navigateProfileView,
  navigateFilePreview,
  navigateNotifications,
  navigateFullScreenVideo,
  navigatePostView,
} from '../actions/navigation';
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
import { fetchProfile } from '../actions/profile';
import { fetchFriends } from '../actions/friends';
import Comment from '../types/Comment';
import ImagePickerOptions from '../types/Shared';
import Profile from '../types/Profile';

const mapStateToProps = ({ profile, home, friends, sharedInfo }) => ({
  profile: profile.profile,
  feed: home.feed,
  friends: friends.friends,
  users: sharedInfo.users,
});

const mapDispatchToProps = dispatch => ({
  viewPost: id => dispatch(navigatePostView(id)),
  goToProfile: () => dispatch(navigateProfile()),
  viewProfile: uid => dispatch(navigateProfileView(uid)),
  postStatus: status => dispatch(addPost(status)),
  onRepPost: item => dispatch(repPost(item)),
  previewFile: (type, uri, message, text) => dispatch(navigateFilePreview(type, uri, message, text)),
  comment: (uid, postId, text, created_at, parentCommentId) =>
    dispatch(postComment(uid, postId, text, created_at, parentCommentId)),
  getComments: (key: string, amount?: number, endAt?: string) => dispatch(fetchComments(key, amount, endAt)),
  repComment: comment => dispatch(repComment(comment)),
  getPosts: (uid, amount, endAt) => dispatch(fetchPosts(uid, amount, endAt)),
  getCommentRepsUsers: (comment, limit) => dispatch(fetchCommentRepsUsers(comment, limit)),
  getRepsUsers: (postId: string, limit?: number) => dispatch(fetchRepsUsers(postId, limit)),
  onNotificationPress: () => dispatch(navigateNotifications()),
  getProfile: () => dispatch(fetchProfile()),
  getFriends: () => dispatch(fetchFriends()),
  navigateFullScreenVideo: uri => dispatch(navigateFullScreenVideo(uri)),
  getReplies: (fromCommentId: Comment, limit: number, endAt?: string) =>
    dispatch(fetchReplies(fromCommentId, limit, endAt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
