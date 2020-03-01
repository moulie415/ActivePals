import React, { FunctionComponent } from 'react';
import ModalBox from 'react-native-modalbox';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import IIcon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import colors from '../../constants/colors';
import { fetchRepsUsers } from '../../actions/home';
import RepsModalProps from '../../types/components/RepsModal';
import styles from '../../styles/components/RepsModal';

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
    <ModalBox isOpen={isOpen} onClosed={() => onClosed()} style={styles.container} key={isOpen ? 1 : 2}>
      <Text style={styles.likeHeader}>Users that repped the comment</Text>
      <FlatList
        keyExtractor={item => item}
        renderItem={({ item }) => {
          const { uid } = profile;
          const user = item === uid ? profile : friends[item] || users[item];
          const isYou = item === uid;

          return user ? (
            <TouchableOpacity
              onPress={() => {
                isYou ? navigation.navigate('Profile') : navigation.navigate('ProfileView', { uid });
              }}
              style={styles.likeButton}
            >
              <View style={styles.likeContainer}>
                {user.avatar ? (
                  <Image style={styles.likeImage} source={{ uri: user.avatar }} />
                ) : (
                  <IIcon name="md-contact" size={40} style={styles.defaultIcon} />
                )}
                <Text>{isYou ? 'You' : user.username}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <PulseIndicator />
          );
        }}
        data={uids}
        ListFooterComponent={() =>
          repCount > uids.length ? (
            <TouchableOpacity
              style={{ alignItems: 'center' }}
              onPress={() => {
                getRepUsers(id, 10, uids[uids.length - 1])
              }}
            >
              <Text style={{ color: colors.secondary }}>Show more</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </ModalBox>
  );
};

const mapStateToProps = ({ friends, sharedInfo, profile, home }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  repsUsers: home.repsUsers,
});

const mapDispatchToProps = dispatch => ({
  getRepUsers: (postId: string, limit?: number) => dispatch(fetchRepsUsers(postId, limit)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RepsModal);
