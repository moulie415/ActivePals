import React, {FunctionComponent} from 'react';
import ModalBox from 'react-native-modalbox';
import {
  FlatList,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import {fetchRepsUsers} from '../../actions/home';
import RepsModalProps from '../../types/components/RepsModal';
import styles from '../../styles/components/RepsModal';
import {Text, Icon, List} from '@ui-kitten/components';

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
      isOpen={isOpen}
      onClosed={() => onClosed()}
      style={styles.container}
      key={isOpen ? 1 : 2}>
      <Text style={styles.likeHeader}>Users that repped the comment</Text>
      <List
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
                  <Icon
                    name="md-contact"
                    size={40}
                    style={styles.defaultIcon}
                  />
                )}
                <Text>{isYou ? 'You' : user.username}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <ActivityIndicator />
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

const mapStateToProps = ({friends, sharedInfo, profile, home}) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  repsUsers: home.repsUsers,
});

const mapDispatchToProps = (dispatch) => ({
  getRepUsers: (postId: string, limit?: number) =>
    dispatch(fetchRepsUsers(postId, limit)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RepsModal);
