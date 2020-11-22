import {Layout, Text} from '@ui-kitten/components';
import React, {FunctionComponent} from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import Image from 'react-native-fast-image';
import Video from 'react-native-video';
import {getSimplifiedTime} from '../../constants/utils';
import PostProps from '../../types/components/Post';
import {PostType} from '../../types/Post';
import Avatar from '../Avatar/Avatar';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import styles from '../../styles/homeStyles';
import RepCommentCount from '../RepCommentCount/RepCommentCount';
import RepsAndComments from '../RepsAndComments/RepsAndComments';

const Post: FunctionComponent<PostProps> = ({
  item,
  profile,
  navigation,
  friends,
  users,
  setLikesModalVisible,
  setRepsId,
  setRepCount,
  getRepsUsers,
  setPostId,
  setShowCommentModal,
  getComments,
  setSpinner,
  setFocusCommentInput,
  onRepPost,
  setSelectedPost,
  actionSheetRef,
  setShowImage,
  setSelectedImage,
  setPlaying,
  players,
  playing,
}) => {
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
  const renderAvatar = (uid: string) => {
    if (profile.avatar && uid === profile.uid) {
      return (
        <TouchableOpacity
          style={{marginRight: 10}}
          onPress={() =>
            uid !== profile.uid
              ? navigation.navigate('ProfileView', {uid})
              : navigation.navigate('Profile')
          }>
          <Avatar uri={profile.avatar} size={35} />
        </TouchableOpacity>
      );
    }
    if (friends[uid] && friends[uid].avatar) {
      return (
        <TouchableOpacity
          style={{marginRight: 10}}
          onPress={() =>
            uid !== profile.uid
              ? navigation.navigate('ProfileView', {uid})
              : navigation.navigate('Profile')
          }>
          <Avatar uri={friends[uid].avatar} size={35} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={{marginRight: 10}}
        onPress={() =>
          uid !== profile.uid
            ? navigation.navigate('ProfileView', {uid})
            : navigation.navigate('Profile')
        }>
        <ThemedIcon name="person" size={45} />
      </TouchableOpacity>
    );
  };

  switch (item.type) {
    case PostType.STATUS:
      return (
        <Layout style={{padding: 10, margin: 5}}>
          <View style={{flexDirection: 'row', flex: 1, marginBottom: 10}}>
            {renderAvatar(item.uid)}
            <Layout style={{flex: 1}}>
              {getUsernameFormatted(item.uid)}
              <Text>{getSimplifiedTime(item.createdAt)}</Text>
            </Layout>
            <TouchableOpacity
              onPress={() => {
                if (item.key) {
                  setSelectedPost(item.key);
                  actionSheetRef.current?.show();
                }
              }}>
              <ThemedIcon
                style={{paddingHorizontal: 10}}
                name="more-horizontal"
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={{marginBottom: 5}}>
            <Text>{item.text}</Text>
          </View>
          <RepCommentCount
            item={item}
            setLikesModalVisible={setLikesModalVisible}
            setRepsId={setRepsId}
            setRepCount={setRepCount}
            getRepsUsers={getRepsUsers}
            setPostId={setPostId}
            setShowCommentModal={setShowCommentModal}
            getComments={getComments}
          />
          <RepsAndComments
            item={item}
            profile={profile}
            setSpinner={setSpinner}
            setFocusCommentInput={setFocusCommentInput}
            setPostId={setPostId}
            setShowCommentModal={setShowCommentModal}
            getComments={getComments}
            onRepPost={onRepPost}
          />
        </Layout>
      );
    case PostType.PHOTO:
      return (
        <View>
          <View style={{flexDirection: 'row', flex: 1, padding: 10}}>
            {renderAvatar(item.uid)}
            <View style={{flex: 1}}>
              {getUsernameFormatted(item.uid)}
              <Text>{getSimplifiedTime(item.createdAt)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (item.key) {
                  setSelectedPost(item.key);
                  actionSheetRef.current?.show();
                }
              }}>
              <ThemedIcon
                style={{paddingHorizontal: 10}}
                name="more-horizontal"
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={{margin: 5, marginHorizontal: 10}}>
            <Text>{item.text}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (item.url) {
                setSelectedImage([{url: item.url}]);
                setShowImage(true);
              }
            }}
            style={{marginTop: 10, marginBottom: 10}}>
            <Image
              style={{width: '100%', height: 400}}
              resizeMode="cover"
              source={{uri: item.url}}
            />
          </TouchableOpacity>
          <RepCommentCount
            item={item}
            setLikesModalVisible={setLikesModalVisible}
            setRepsId={setRepsId}
            setRepCount={setRepCount}
            getRepsUsers={getRepsUsers}
            setPostId={setPostId}
            setShowCommentModal={setShowCommentModal}
            getComments={getComments}
          />
          <View style={{padding: 10}}>
            <RepsAndComments
              item={item}
              profile={profile}
              setSpinner={setSpinner}
              setFocusCommentInput={setFocusCommentInput}
              setPostId={setPostId}
              setShowCommentModal={setShowCommentModal}
              getComments={getComments}
              onRepPost={onRepPost}
            />
          </View>
        </View>
      );
    case PostType.VIDEO:
      return (
        <View>
          <View style={{flexDirection: 'row', flex: 1, padding: 10, zIndex: 2}}>
            {renderAvatar(item.uid)}
            <View style={{flex: 1}}>
              {getUsernameFormatted(item.uid)}
              <Text>{getSimplifiedTime(item.createdAt)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (item.key) {
                  setSelectedPost(item.key);
                  actionSheetRef.current?.show();
                }
              }}>
              <ThemedIcon
                style={{paddingHorizontal: 10}}
                name="more-horizontal"
                size={20}
              />
            </TouchableOpacity>
          </View>
          <View style={{margin: 10}}>
            <Text>{item.text}</Text>
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              setPlaying({[item.uid]: false});
            }}>
            <Video
              ref={(ref) => {
                if (item.key && ref) {
                  players.current[item.key] = ref;
                }
              }}
              source={{uri: item.url}}
              style={{width: '100%', height: 400}}
              paused={!playing[item.key]}
              ignoreSilentSwitch="ignore"
              repeat
              onFullscreenPlayerDidPresent={() =>
                setPlaying({[item.key]: false})
              }
              resizeMode="cover"
              onBuffer={() => {
                console.log('buffering');
              }} // Callback when remote video is buffering
              onError={(e) => Alert.alert('Error', e.error.errorString)}
            />
          </TouchableWithoutFeedback>
          {!playing[item.key] && (
            <View style={styles.playButtonContainer}>
              <TouchableOpacity onPress={() => setPlaying({[item.key]: true})}>
                <ThemedIcon
                  size={50}
                  name="play-circle"
                  fill="#fff"
                  style={{
                    backgroundColor: 'transparent',
                    opacity: 0.8,
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  bottom:
                    (item.repCount && item.repCount > 0) ||
                    (item.commentCount && item.commentCount > 0)
                      ? 110
                      : 70,
                  right: 15,
                  position: 'absolute',
                  padding: 2,
                  paddingHorizontal: 6,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 5,
                }}
                onPress={() => {
                  if (item.key) {
                    setPlaying({[item.key]: false});
                    if (Platform.OS === 'ios') {
                      players.current[item.key].presentFullscreenPlayer();
                    } else {
                      navigation.navigate('FullScreenVideo', {uri: item.url});
                    }
                  }
                }}>
                <ThemedIcon name="expand" size={30} fill="#fff" style={{}} />
              </TouchableOpacity>
            </View>
          )}
          <RepCommentCount
            item={item}
            setLikesModalVisible={setLikesModalVisible}
            setRepsId={setRepsId}
            setRepCount={setRepCount}
            getRepsUsers={getRepsUsers}
            setPostId={setPostId}
            setShowCommentModal={setShowCommentModal}
            getComments={getComments}
          />
          <View style={{padding: 10}}>
            <RepsAndComments
              item={item}
              profile={profile}
              setSpinner={setSpinner}
              setFocusCommentInput={setFocusCommentInput}
              setPostId={setPostId}
              setShowCommentModal={setShowCommentModal}
              getComments={getComments}
              onRepPost={onRepPost}
            />
          </View>
        </View>
      );
    default:
      return null;
  }
};

export default Post;
