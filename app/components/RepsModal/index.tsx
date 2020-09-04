import React, {FunctionComponent} from 'react';
import {TouchableOpacity, View} from 'react-native';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import {fetchRepsUsers} from '../../actions/home';
import RepsModalProps from '../../types/components/RepsModal';
import styles from '../../styles/components/RepsModal';
import {
  Text,
  Icon,
  List,
  Divider,
  Spinner,
  Modal,
  Card,
  ListItem,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import globalStyles from '../../styles/globalStyles';
import Avatar from '../Avatar/Avatar';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

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
    <Modal
      visible={isOpen}
      onBackdropPress={onClosed}
      style={styles.container}
      backdropStyle={globalStyles.backdrop}>
      <Card disabled>
        <Text style={styles.likeHeader}>Users that repped the comment</Text>
        <List
          ItemSeparatorComponent={Divider}
          keyExtractor={(item) => item}
          renderItem={({item}) => {
            const {uid} = profile;
            const user = item === uid ? profile : friends[item] || users[item];
            const isYou = item === uid;
            return user ? (
              <ListItem
                onPress={() => {
                  isYou
                    ? navigation.navigate('Profile')
                    : navigation.navigate('ProfileView', {uid});
                }}
                title={isYou ? 'You' : user.username}
                accessoryLeft={() =>
                  user.avatar ? (
                    <Avatar uri={user.avatar} size={30} />
                  ) : (
                    <ThemedIcon name="person" size={30} />
                  )
                }
              />
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
      </Card>
    </Modal>
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
