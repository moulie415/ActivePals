import React, {FunctionComponent, useState, useEffect} from 'react';
import Modal from 'react-native-modalbox';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import {
  View,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import {sendRequest, fetchFbFriends} from '../../actions/friends';
import {getNameString} from '../../constants/utils';
import FbFriendsModalProps from '../../types/components/FbFriendsModalProps';
import Profile from '../../types/Profile';
import {Text, Button, Icon, Layout} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';

const FbFriendsModal: FunctionComponent<FbFriendsModalProps> = ({
  profile,
  getFbFriends,
  friends,
  onClosed,
  request,
  isOpen,
}) => {
  const [selectedFriends, setSelectdFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fbFriends, setFbFriends] = useState({});

  useEffect(() => {
    const getFriends = async () => {
      const fbFriends = await getFbFriends(profile.token);
      setFbFriends(fbFriends);
      setLoading(false);
    };
    getFriends();
  }, [getFbFriends, profile.token]);

  const onFriendPress = (friend: Profile) => {
    if (friend.username) {
      const {uid} = friend;
      if (selectedFriends.some((f) => f === uid)) {
        const friends = selectedFriends.filter((f) => f !== uid);
        setSelectdFriends(friends);
      } else {
        setSelectdFriends([...selectedFriends, uid]);
      }
    } else {
      Alert.alert(
        'Sorry',
        'Please ask your friend to set their username before adding them as a pal',
      );
    }
  };

  const renderFriendsSelection = () => {
    const newFriends = [];
    if (fbFriends) {
      Object.values(fbFriends).forEach((friend, index) => {
        const selected = selectedFriends.some((uid) => uid === friend.uid);
        if (!friends[friend.uid]) {
          newFriends.push(
            <TouchableOpacity
              key={friend.uid}
              onPress={() => onFriendPress(friend)}>
              <Layout
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                  marginBottom: 0.5,
                  marginTop: index === 0 ? 0.5 : 0,
                }}>
                <Layout
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 30,
                    justifyContent: 'space-between',
                  }}>
                  <Layout style={{flexDirection: 'row', alignItems: 'center'}}>
                    {friend.avatar ? (
                      <Image
                        source={{uri: friend.avatar}}
                        style={{height: 30, width: 30, borderRadius: 15}}
                      />
                    ) : (
                      <Icon
                        name="md-contact"
                        size={35}
                        style={{
                          marginTop: Platform.OS === 'ios' ? -2 : 0,
                        }}
                      />
                    )}
                    <Text style={{marginHorizontal: 10}}>
                      {getNameString(friend)}
                    </Text>
                    {selected && (
                      <Icon
                        size={25}
                        name="ios-checkmark-circle"
                        style={{
                          textAlign: 'right',
                          flex: 1,
                        }}
                      />
                    )}
                  </Layout>
                </Layout>
              </Layout>
            </TouchableOpacity>,
          );
        }
      });
    }

    return newFriends.length > 0 ? (
      <ScrollView>{friends}</ScrollView>
    ) : (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{padding: 15, textAlign: 'center'}}>
          Sorry we couldn't find anymore of your Facebook friends already using
          ActivePals
        </Text>
      </View>
    );
  };

  return (
    <Modal
      onClosed={onClosed}
      isOpen={isOpen}
      style={styles.modal}
      position="center"
      key={isOpen ? 1 : 2}>
      <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
        Select Facebook friends
      </Text>
      {loading ? <ActivityIndicator /> : renderFriendsSelection()}
      <Layout
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginVertical: 10,
        }}>
        <Button onPress={() => onClosed()} status="danger">
          Cancel
        </Button>
        <Button
          onPress={async () => {
            const {length} = selectedFriends;
            if (length > 0) {
              await Promise.all(
                selectedFriends.map((friend) => {
                  return request(friend);
                }),
              );
              onClosed();
              Alert.alert(
                'Success',
                `Pal request${length > 1 ? 's' : ''} sent`,
              );
            } else {
              Alert.alert('Sorry', 'Please select at least one friend');
            }
          }}>
          Send requests
        </Button>
      </Layout>
    </Modal>
  );
};

const mapStateToProps = ({friends, profile}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  request: (friendUid: string) => dispatch(sendRequest(friendUid)),
  getFbFriends: (token: string) => dispatch(fetchFbFriends(token)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FbFriendsModal);
