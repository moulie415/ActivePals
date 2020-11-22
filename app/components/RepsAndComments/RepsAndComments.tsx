import React, {FunctionComponent} from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import Share, {Options} from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RepsAndCommentsProps from '../../types/components/RepsAndComments';
import RepIcon from '../RepIcon/RepIcon';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

const RepsAndComments: FunctionComponent<RepsAndCommentsProps> = ({
  item,
  setSpinner,
  profile,
  onRepPost,
  setFocusCommentInput,
  setPostId,
  setShowCommentModal,
  getComments,
}) => {
  const sharePost = async () => {
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
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10,
      }}>
      {item.type !== 'video' && (
        <TouchableOpacity
          onPress={() => {
            sharePost();
          }}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 25,
            alignItems: 'center',
          }}>
          <ThemedIcon size={25} name="share" />
          {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Share</Text> */}
        </TouchableOpacity>
      )}
      <RepIcon onPress={() => onRepPost(item)} active={item.rep} size={25} />
      <TouchableOpacity
        onPress={() => {
          setFocusCommentInput(true);
          setPostId(item.key);
          setShowCommentModal(true);
          getComments(item.key);
        }}
        style={{
          flexDirection: 'row',
          paddingHorizontal: 25,
          alignItems: 'center',
        }}>
        <ThemedIcon name="message-square" size={25} />
        {/* <Text style={{color: colors.postIcon, marginLeft: 10}}>Comment</Text> */}
      </TouchableOpacity>
    </View>
  );
};

export default RepsAndComments;
