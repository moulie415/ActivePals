import React, {Component, createRef, RefObject} from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Image as SlowImage,
} from 'react-native';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import Video from 'react-native-video';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';

import {getMentionsList, guid} from '../constants/utils';
import sStyles from '../styles/settingsStyles';
import styles from '../styles/homeStyles';
import {addPost} from '../actions/home';
import {setMessage} from '../actions/chats';
import FilePreviewProps from '../types/views/FilePreview';
import {
  TaskEvent,
  TaskState,
  MyRootState,
  MyThunkDispatch,
} from '../types/Shared';
import Profile from '../types/Profile';
import {Text, Icon, List, Divider, Spinner, Input} from '@ui-kitten/components';

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
    const {navigation} = this.props;
    const {params} = navigation.state;
    this.player = createRef<Video>();
    this.state = {
      paused: true,
      text: params.text,
      spinner: false,
      mentionList: [],
    };
  }

  componentDidMount() {
    const {navigation} = this.props;
    const {type} = navigation.state.params;
    if (type === 'video' && this.player.current) {
      this.player.current.presentFullscreenPlayer();
      this.player.current.seek(0);
    }
  }

  previewView() {
    const {navigation} = this.props;
    const {type} = navigation.state.params;
    if (type === 'video') {
      return this.renderVideo();
    }
    if (type === 'image') {
      return this.renderImage();
    }
    return null;
  }

  uploadImage(
    uri: string,
    mime = 'application/octet-stream',
  ): Promise<{url: string; id: string}> {
    const {
      navigation,
      profile: {uid},
    } = this.props;
    const {type, message} = navigation.state.params;
    const mimeType = type === 'video' ? 'video/mp4' : mime;
    const imagePath = message ? '/messages' : '/photos';
    const ref =
      type === 'image' ? `images/${uid}${imagePath}` : `videos/${uid}`;
    return new Promise((resolve, reject) => {
      // const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
      const id = guid();
      const imageRef = storage().ref(ref).child(id);

      imageRef.putFile(uri, {contentType: mimeType}).on(
        TaskEvent.STATE_CHANGED,
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.setState({progress});
          switch (snapshot.state) {
            case TaskState.SUCCESS: // or 'success'
              console.log('Upload is complete');
              break;
            case TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
            default:
              console.log(snapshot.state);
          }
        },
        (e) => {
          Alert.alert('Error', e.message);
          reject();
        },
        (result) => {
          if (result && result.downloadURL) {
            resolve({url: result.downloadURL, id});
          } else {
            reject();
          }
        },
      );
    });
  }

  async acceptPressed() {
    this.setState({spinner: true});
    const {navigation, profile, postStatus, setPostMessage} = this.props;
    const {text} = this.state;
    const {uri, message} = navigation.state.params;
    const {type: paramType} = navigation.state.params;
    const type = paramType === 'image' ? 'photo' : 'video';
    const ref = paramType === 'image' ? 'userPhotos/' : 'userVideos/';
    try {
      const image = await this.uploadImage(uri);
      const date = new Date().toString();
      if (message) {
        navigation.goBack();
        setPostMessage(image.url, text);
      } else {
        database()
          .ref(ref + profile.uid)
          .child(image.id)
          .set({createdAt: date, url: image.url});
        await postStatus({
          type,
          url: image.url,
          text,
          uid: profile.uid,
          createdAt: date,
        });
        navigation.goBack();
        Alert.alert('Success', 'Post submitted');
        this.setState({spinner: false});
      }
    } catch (e) {
      Alert.alert('Error', e.message);
      this.setState({spinner: false});
    }
  }

  renderImage() {
    const {navigation, friends} = this.props;
    const {uri, message} = navigation.state.params;
    const {mentionList, text, spinner} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{flex: 1}}>
          <View style={{flex: 1}}>
            <SlowImage
              style={{flex: 1, resizeMode: 'contain'}}
              source={{uri}}
            />
            <View style={{position: 'absolute', margin: 20, marginTop: 30}}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  opacity: 0.8,
                  padding: 10,
                  paddingHorizontal: 15,
                  borderRadius: 5,
                }}>
                <Icon size={30} name="md-close" style={{color: '#fff'}} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                position: 'absolute',
                margin: 20,
                marginTop: 30,
                right: 0,
              }}>
              <TouchableOpacity
                onPress={() => this.acceptPressed()}
                style={{
                  opacity: 0.8,
                  padding: 10,
                  paddingHorizontal: 15,
                  borderRadius: 5,
                }}>
                <Icon size={30} name="md-checkmark" style={{color: '#fff'}} />
              </TouchableOpacity>
            </View>
            {mentionList && !message && this.renderMentionList()}
            <Input
              style={{
                height: 50,
                paddingLeft: 10,
                width: '100%',
                fontSize: 18,
              }}
              maxLength={280}
              underlineColorAndroid="transparent"
              onChangeText={(input) => {
                this.setState({text: input});
                const mentionFriends = Object.values(friends);
                const list = getMentionsList(input, mentionFriends);
                list
                  ? this.setState({mentionList: list})
                  : this.setState({mentionList: null});
              }}
              value={text}
              multiline={false}
              autoCorrect
              placeholder="Add comment..."
            />
            {spinner && (
              <View style={sStyles.spinner}>
                <Spinner />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  renderVideo() {
    const {navigation, friends} = this.props;
    const {paused, mentionList, text, spinner, progress} = this.state;
    const {uri, message} = navigation.state.params;
    return (
      <SafeAreaView style={{flex: 1}}>
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({paused: true});
            Keyboard.dismiss();
          }}>
          <View style={{flex: 1}}>
            <Video
              ref={this.player}
              source={{uri}}
              style={{flex: 1}}
              paused={paused}
              ignoreSilentSwitch="ignore"
              repeat
              resizeMode="cover"
            />
            <View style={styles.playButtonContainer}>
              <TouchableOpacity onPress={() => this.setState({paused: false})}>
                {paused && (
                  <Icon
                    name="md-play"
                    size={75}
                    style={{
                      color: '#fff',
                      backgroundColor: 'transparent',
                      opacity: 0.8,
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View style={{position: 'absolute', margin: 20}}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  opacity: 0.8,
                  padding: 10,
                  borderRadius: 5,
                }}>
                <Icon size={30} name="md-close" style={{color: '#fff'}} />
              </TouchableOpacity>
            </View>
            <View style={{position: 'absolute', margin: 20, right: 0}}>
              <TouchableOpacity
                onPress={() => this.acceptPressed()}
                style={{
                  opacity: 0.8,
                  padding: 10,
                  borderRadius: 5,
                }}>
                <Icon size={30} name="md-checkmark" style={{color: '#fff'}} />
              </TouchableOpacity>
            </View>
            {mentionList && !message && this.renderMentionList()}
            <Input
              style={{
                height: 50,
                paddingLeft: 10,
                width: '100%',
                fontSize: 18,
              }}
              underlineColorAndroid="transparent"
              onChangeText={(newText) => {
                this.setState({text: newText});
                const newFriends = Object.values(friends);
                const list = getMentionsList(newText, newFriends);
                list
                  ? this.setState({mentionList: list})
                  : this.setState({mentionList: null});
              }}
              value={text}
              multiline={false}
              autoCorrect
              placeholder="Add comment..."
            />
            {spinner && (
              <View style={sStyles.spinner}>
                <Spinner />
                {!!progress && (
                  <Text style={{color: '#fff'}}>{`${progress}%`}</Text>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  renderMentionList() {
    const {mentionList, text} = this.state;
    return (
      <View style={[styles.mentionList, {bottom: 0, marginBottom: 50}]}>
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
                    const split = text.split(' ');
                    split[split.length - 1] = `@${item.username} `;
                    this.setState({text: split.join(' '), mentionList: null});
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
                    <Icon name="md-contact" size={35} />
                  )}
                  <Text style={{marginLeft: 10}}>{item.username}</Text>
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
        <KeyboardAvoidingView behavior="padding" style={{flex: 1}}>
          {this.previewView()}
        </KeyboardAvoidingView>
      ),
      android: this.previewView(),
    });
  }
}

const mapStateToProps = ({profile, friends}: MyRootState) => ({
  profile: profile.profile,
  friends: friends.friends,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  postStatus: (status: string) => dispatch(addPost(status)),
  setPostMessage: (url: string, text: string) =>
    dispatch(setMessage(url, text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FilePreview);
