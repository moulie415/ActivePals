import React, { FunctionComponent } from 'react';
import ModalBox from 'react-native-modalbox';
import { FlatList, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import IIcon from 'react-native-vector-icons/Ionicons';
import RepsModalProps from '../../types/components/RepsModal';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import styles from '../../styles/components/RepsModal';

const RepsModal: FunctionComponent<RepsModalProps> = ({ uids, isOpen, onClosed, profile, friends, users }) => {
  return (
    <ModalBox isOpen={isOpen} onClosed={() => onClosed()} style={styles.container}>
      <Text style={styles.likeHeader}>Users that repped the comment</Text>
      <FlatList
        keyExtractor={item => item}
        renderItem={({ item }) => {
          const uid = profile.uid;
          const user = item === uid ? profile : friends[item] || users[item];

          return user ? (
            <TouchableOpacity
              onPress={() => {
                console.log('test');
              }}
              style={styles.likeButton}
            >
              <View style={styles.likeContainer}>
                {user.avatar ? (
                  <Image style={styles.likeImage} source={{ uri: user.avatar }} />
                ) : (
                  <IIcon name="md-contact" size={40} style={styles.defaultIcon} />
                )}
                <Text>{item === uid ? 'You' : user.username}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <PulseIndicator />
          );
        }}
        data={uids}
      />
    </ModalBox>
  );
};

import { connect } from 'react-redux';

const mapStateToProps = ({ friends, sharedInfo, profile }) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
});

export default connect(mapStateToProps, null)(RepsModal);
