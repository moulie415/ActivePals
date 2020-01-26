import React, { Component, createRef, RefObject } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  FlatList,
  TouchableOpacity,
  Image as SlowImage,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firebase, { RNFirebase } from 'react-native-firebase';
import Video from 'react-native-video';
import Image from 'react-native-fast-image';
import { PulseIndicator } from 'react-native-indicators';
import { connect } from 'react-redux';
import Text from '../components/Text';
import colors from '../constants/colors';
import { getMentionsList, guid } from '../constants/utils';
import sStyles from '../styles/settingsStyles';
import styles from '../styles/homeStyles';
import { navigateBack } from '../actions/navigation';
import { addPost } from '../actions/home';
import { setMessage } from '../actions/chats';
import FilePreviewProps from '../types/views/FilePreview';
import Profile from '../types/Profile';

interface State {
  paused: boolean;
  text: string;
  spinner: boolean;
  progress?: number;
  mentionList: Profile[];
}

class FilePreview extends Component<FilePreviewProps, State> {
  player: RefObject<Video>;

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const { params } = navigation.state;
    this.player = createRef<Video>();
    this.state = {
      paused: true,
      text: params.text,
      spinner: false,
      mentionList: [],
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    const { type } = navigation.state.params;
    if (type === 'video' && this.player.current) {
      this.player.current.presentFullscreenPlayer();
      this.player.current.seek(0);
    }
  }

  static navigationOptions = {
    header: null,
  };

  previewView() {
    const { navigation } = this.props;
    const { type } = navigation.state.params;
    if (type === 'video') {
      return this.renderVideo();
    }
    if (type === 'image') {
      return this.renderImage();
    }
    return null;
  }

  uploadImage(uri, mime = 'application/octet-stream'): Promise<{ url: string; id: string }> {
    const {
      navigation,
      profile: { uid },
    } = this.props;
    const { type, message } = navigation.state.params;
    const mimeType = type === 'video' ? 'video/mp4' : mime;
    const imagePath = message ? '/messages' : '/photos';
    const ref = type === 'image' ? `images/${uid}${imagePath}` : `videos/${uid}`;
    return new Promise((resolve, reject) => {
      // const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      const id = guid();
      const imageRef = firebase
        .storage()
        .ref(ref)
        .child(id);

      imageRef.putFile(uri, { contentType: mimeType }).on(
        RNFirebase.storage.TaskEvent.STATE_CHANGED,
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({ progress });
          switch (snapshot.state) {
            case RNFirebase.storage.TaskState.SUCCESS: // or 'success'
              console.log('Upload is complete');
              break;
            case RNFirebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
            default:
              console.log(snapshot.state);
          }
        },
        e => {
          Alert.alert('Error', e.message);
          reject();
        },
        result => {
          if (result && result.downloadURL) {
            resolve({ url: result.downloadURL, id });
          } else reject();
        }
      );
    });
  }

  async acceptPressed() {
    this.setState({ spinner: true });
    const { navigation, profile, goBack, postStatus, setPostMessage } = this.props;
    const { text } = this.state;
    const { uri, message } = navigation.state.params;
    const { type: paramType } = navigation.state.params;
    const type = paramType === 'image' ? 'photo' : 'video';
    const ref = paramType === 'image' ? 'userPhotos/' : 'userVideos/';
    try {
      const image = await this.uploadImage(uri);
      const date = new Date().toString();
      if (message) {
        goBack();
        setPostMessage(image.url, text);
      } else {
        firebase
          .database()
          .ref(ref + profile.uid)
          .child(image.id)
          .set({ createdAt: date, url: image.url });
        await postStatus({
          type,
          url: image.url,
          text,
          uid: profile.uid,
          createdAt: date,
        });
        goBack();
        Alert.alert('Success', 'Post submitted');
        this.setState({ spinner: false });
      }
    } catch (e) {
      Alert.alert('Error', e.message);
      this.setState({ spinner: false });
    }
  }

  renderImage() {
    const { goBack, navigation, friends } = this.props;
    const { uri, message } = navigation.state.params;
    const { mentionList, text, spinner } = this.state;
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <SlowImage style={{ flex: 1, resizeMode: 'contain' }} source={{ uri }} />
          <View style={{ position: 'absolute', margin: 20, marginTop: 30 }}>
            <TouchableOpacity
              onPress={() => goBack()}
              style={{
                backgroundColor: colors.secondary,
                opacity: 0.8,
                padding: 10,
                paddingHorizontal: 15,
                borderRadius: 5,
              }}
            >
              <Icon size={30} name="md-close" style={{ color: '#fff' }} />
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', margin: 20, marginTop: 30, right: 0 }}>
            <TouchableOpacity
              onPress={() => this.acceptPressed()}
              style={{
                backgroundColor: colors.secondary,
                opacity: 0.8,
                padding: 10,
                paddingHorizontal: 15,
                borderRadius: 5,
              }}
            >
              <Icon size={30} name="md-checkmark" style={{ color: '#fff' }} />
            </TouchableOpacity>
          </View>
          {mentionList && !message && this.renderMentionList()}
          <TextInput
            style={{
              height: 50,
              paddingLeft: 10,
              width: '100%',
              fontSize: 18,
              backgroundColor: '#fff',
            }}
            maxLength={280}
            underlineColorAndroid="transparent"
            onChangeText={input => {
              this.setState({ text: input });
              const mentionFriends = Object.values(friends);
              const list = getMentionsList(input, mentionFriends);
              list ? this.setState({ mentionList: list }) : this.setState({ mentionList: null });
            }}
            value={text}
            multiline={false}
            autoCorrect
            placeholder="Add comment..."
          />
          {spinner && (
            <View style={sStyles.spinner}>
              <PulseIndicator color={colors.secondary} />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  renderVideo() {
    const { goBack, navigation, friends } = this.props;
    const { paused, mentionList, text, spinner, progress } = this.state;
    const { uri, message } = navigation.state.params;
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          this.setState({ paused: true });
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1 }}>
          <Video
            ref={this.player}
            source={{ uri }}
            style={{ flex: 1 }}
            paused={paused}
            ignoreSilentSwitch="ignore"
            repeat
            resizeMode="cover"
          />
          <View style={styles.playButtonContainer}>
            <TouchableOpacity onPress={() => this.setState({ paused: false })}>
              {paused && (
                <Icon
                  name="md-play"
                  size={75}
                  style={{ color: '#fff', backgroundColor: 'transparent', opacity: 0.8 }}
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', margin: 20 }}>
            <TouchableOpacity
              onPress={() => goBack()}
              style={{ backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5 }}
            >
              <Icon size={30} name="md-close" style={{ color: '#fff' }} />
            </TouchableOpacity>
          </View>
          <View style={{ position: 'absolute', margin: 20, right: 0 }}>
            <TouchableOpacity
              onPress={() => this.acceptPressed()}
              style={{ backgroundColor: colors.secondary, opacity: 0.8, padding: 10, borderRadius: 5 }}
            >
              <Icon size={30} name="md-checkmark" style={{ color: '#fff' }} />
            </TouchableOpacity>
          </View>
          {mentionList && !message && this.renderMentionList()}
          <TextInput
            style={{
              height: 50,
              paddingLeft: 10,
              width: '100%',
              fontSize: 18,
              backgroundColor: '#fff',
            }}
            underlineColorAndroid="transparent"
            onChangeText={newText => {
              this.setState({ text: newText });
              const newFriends = Object.values(friends);
              const list = getMentionsList(newText, newFriends);
              list ? this.setState({ mentionList: list }) : this.setState({ mentionList: null });
            }}
            value={text}
            multiline={false}
            autoCorrect
            placeholder="Add comment..."
          />
          {spinner && (
            <View style={sStyles.spinner}>
              <PulseIndicator color={colors.secondary} />
              {!!progress && <Text style={{ color: '#fff' }}>{`${progress}%`}</Text>}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  renderMentionList() {
    const { mentionList, text } = this.state;
    return (
      <View style={[styles.mentionList, { bottom: 0, marginBottom: 50 }]}>
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
                    const split = text.split(' ');
                    split[split.length - 1] = `@${item.username} `;
                    this.setState({ text: split.join(' '), mentionList: null });
                  }}
                  style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 5 }}
                >
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={{ height: 30, width: 30, borderRadius: 15 }} />
                  ) : (
                    <Icon name="md-contact" size={35} style={{ color: colors.primary }} />
                  )}
                  <Text style={{ marginLeft: 10 }}>{item.username}</Text>
                </TouchableOpacity>
              );
            }
            return null;
          }}
        />
      </View>
    );
  }

  render() {
    return Platform.select({
      ios: (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {this.previewView()}
        </KeyboardAvoidingView>
      ),
      android: this.previewView(),
    });
  }
}

const mapStateToProps = ({ profile, friends }) => ({
  profile: profile.profile,
  friends: friends.friends,
});

const mapDispatchToProps = dispatch => ({
  goBack: () => dispatch(navigateBack()),
  postStatus: status => dispatch(addPost(status)),
  setPostMessage: (url, text) => dispatch(setMessage(url, text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FilePreview);
