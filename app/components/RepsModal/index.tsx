import React, {FunctionComponent} from 'react';
import ModalBox from 'react-native-modalbox';
import {TouchableOpacity, View} from 'react-native';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import {fetchRepsUsers} from '../../actions/home';
import RepsModalProps from '../../types/components/RepsModal';
import styles from '../../styles/components/RepsModal';
import {Text, Icon, List, Divider, Spinner} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';

const RepsModal: FunctionComponent<RepsModalProps> = ({
  isOpen,
  onClosed,
  profile,
  friends,
  users,
  repCount,
  getRepUsers,
  navigation,
  id,
  repsUsers,
  isComment = false,
}) => {
  const uids = repsUsers[id] ? Object.keys(repsUsers[id]) : [];
  return (
    <ModalBox
      useNativeDriver
      isOpen={isOpen}
      onClosed={() => onClosed()}
      style={styles.container}
      key={isOpen ? 1 : 2}>
      <Text style={styles.likeHeader}>Users that repped the comment</Text>
      <List
        ItemSeparatorComponent={Divider}
        keyExtractor={(item) => item}
        renderItem={({item}) => {
          const {uid} = profile;
          const user = item === uid ? profile : friends[item] || users[item];
          const isYou = item === uid;

          return user ? (
            <TouchableOpacity
              onPress={() => {
                isYou
                  ? navigation.navigate('Profile')
                  : navigation.navigate('ProfileView', {uid});
              }}
              style={styles.likeButton}>
              <View style={styles.likeContainer}>
                {user.avatar ? (
                  <Image style={styles.likeImage} source={{uri: user.avatar}} />
                ) : (
                  <Icon name="person" size={40} style={styles.defaultIcon} />
                )}
                <Text>{isYou ? 'You' : user.username}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Spinner />
          );
        }}
        data={uids}
        ListFooterComponent={() =>
          repCount > uids.length ? (
            <TouchableOpacity
              style={{alignItems: 'center'}}
              onPress={() => {
                getRepUsers(id, 10, uids[uids.length - 1]);
              }}>
              <Text>Show more</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </ModalBox>
  );
};

const mapStateToProps = ({
  friends,
  sharedInfo,
  profile,
  home,
}: MyRootState) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  repsUsers: home.repsUsers,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  getRepUsers: (postId: string, limit?: number) =>
    dispatch(fetchRepsUsers(postId, limit)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RepsModal);
