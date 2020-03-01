import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { View, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import Text from '../Text';
import Button from '../Button';
import styles from './styles';
import { sendRequest, fetchFbFriends } from '../../actions/friends';
import { getNameString } from '../../constants/utils';
import FbFriendsModalProps from '../../types/components/FbFriendsModalProps';
import Profile from '../../types/Profile';

interface State {
  selectedFriends: string[];
  loading: boolean;
  fbFriends: { [key: string]: Profile };
}

class FbFriendsModal extends Component<FbFriendsModalProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFriends: [],
      loading: true,
      fbFriends: {},
    };
  }

  async componentDidMount() {
    const { profile, getFbFriends } = this.props;
    const friends = await getFbFriends(profile.token);
    this.setState({ fbFriends: friends, loading: false });
  }

  onFriendPress(friend) {
    const { selectedFriends } = this.state;
    if (friend.username) {
      const { uid } = friend;
      if (selectedFriends.some(f => f === uid)) {
        const friends = selectedFriends.filter(f => f !== uid);
        this.setState({ selectedFriends: friends });
      } else {
        this.setState({ selectedFriends: [...selectedFriends, uid] });
      }
    } else {
      Alert.alert('Sorry', 'Please ask your friend to set their username before adding them as a pal');
    }
  }

  renderFriendsSelection() {
    const { fbFriends, selectedFriends } = this.state;
    const { friends: propsFriends } = this.props;
    const friends = [];
    if (fbFriends) {
      Object.values(fbFriends).forEach((friend, index) => {
        const selected = selectedFriends.some(uid => uid === friend.uid);
        if (!propsFriends[friend.uid]) {
          friends.push(
            <TouchableOpacity key={friend.uid} onPress={() => this.onFriendPress(friend)}>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                  marginBottom: 0.5,
                  marginTop: index === 0 ? 0.5 : 0,
                }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', height: 30, justifyContent: 'space-between' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {friend.avatar ? (
                      <Image source={{ uri: friend.avatar }} style={{ height: 30, width: 30, borderRadius: 15 }} />
                    ) : (
                      <Icon
                        name="md-contact"
                        size={35}
                        style={{ color: colors.primary, marginTop: Platform.OS === 'ios' ? -2 : 0 }}
                      />
                    )}
                    <Text style={{ marginHorizontal: 10 }}>{getNameString(friend)}</Text>
                    {selected && (
                      <Icon
                        size={25}
                        name="ios-checkmark-circle"
                        style={{ color: colors.primary, textAlign: 'right', flex: 1 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }
      });
    }

    return friends.length > 0 ? (
      <ScrollView style={{ backgroundColor: '#d6d6d6' }}>{friends}</ScrollView>
    ) : (
      <View style={{ backgroundColor: '#fff', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ padding: 15, textAlign: 'center' }}>
          {"Sorry we couldn't find anymore of your Facebook friends already using ActivePals"}
        </Text>
      </View>
    );
  }

  render() {
    const { onClosed, request, isOpen } = this.props;
    const { loading, selectedFriends } = this.state;
    return (
      <Modal onClosed={onClosed} isOpen={isOpen} style={styles.modal} position="center" key={isOpen ? 1 : 2}>
        <Text style={{ fontSize: 20, textAlign: 'center', padding: 10 }}>Select Facebook friends</Text>
        {loading ? <PulseIndicator color={colors.secondary} /> : this.renderFriendsSelection()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
          <Button onPress={() => onClosed()} color="red" text="Cancel" />
          <Button
            onPress={async () => {
              const { length } = selectedFriends;
              if (length > 0) {
                await Promise.all(
                  selectedFriends.map(friend => {
                    return request(friend);
                  })
                );
                onClosed();
                Alert.alert('Success', `Pal request${length > 1 ? 's' : ''} sent`);

              } else {
                Alert.alert('Sorry', 'Please select at least one friend');
              }
            }}
            text="Send requests"
          />
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = ({ friends, profile }) => ({
  friends: friends.friends,
  profile: profile.profile,
});

const mapDispatchToProps = dispatch => ({
  request: friendUid => dispatch(sendRequest(friendUid)),
  getFbFriends: token => dispatch(fetchFbFriends(token)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FbFriendsModal);
