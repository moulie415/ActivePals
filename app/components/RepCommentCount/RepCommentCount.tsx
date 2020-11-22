import {Divider, Layout} from '@ui-kitten/components';
import React, {FunctionComponent} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import RepCommentCountProps from '../../types/components/RepCommentCount';

const RepCommentCount: FunctionComponent<RepCommentCountProps> = ({
  item,
  setLikesModalVisible,
  setRepsId,
  setRepCount,
  getRepsUsers,
  setPostId,
  setShowCommentModal,
  getComments,
}) => {
  if (
    (item.repCount && item.repCount > 0) ||
    (item.commentCount && item.commentCount > 0)
  ) {
    return (
      <Layout>
        <Divider />
        <Layout style={{margin: 10, flexDirection: 'row'}}>
          {!!item.repCount && item.repCount > 0 && (
            <TouchableOpacity
              style={{flex: 1}}
              onPress={async () => {
                setLikesModalVisible(true);
                setRepsId(item.key);
                setRepCount(item.repCount);
                await getRepsUsers(item.key);
              }}>
              <Text>{`${item.repCount} ${
                item.repCount > 1 ? ' reps' : ' rep'
              }`}</Text>
            </TouchableOpacity>
          )}
          {!!item.commentCount && item.commentCount > 0 && (
            <TouchableOpacity
              style={{alignSelf: 'flex-end', flex: 1}}
              onPress={() => {
                setPostId(item.key);
                setShowCommentModal(true);
                getComments(item.key);
              }}>
              <Text style={{textAlign: 'right'}}>
                {`${item.commentCount} ${
                  item.commentCount > 1 ? ' comments' : ' comment'
                }`}
              </Text>
            </TouchableOpacity>
          )}
        </Layout>
        <Divider />
      </Layout>
    );
  }
  return <Divider />;
};

export default RepCommentCount;
