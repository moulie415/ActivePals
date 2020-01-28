import React, { Component } from 'react';
import Modal from 'react-native-modalbox';
import { PulseIndicator } from 'react-native-indicators';
import Image from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { View, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import colors from '../../constants/colors';
import Text, { globalTextStyle } from '../Text';
import Button from '../Button';
import styles from './styles';
import { sendRequest, getFbFriends, fetchFbFriends } from '../../actions/friends';
import { getNameString } from '../../constants/utils';

class FbFriendsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFriends: [],
      loading: true,
      fbFriends: [],
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
      if (selectedFriends.some(friend => friend === uid)) {
        const friends = selectedFriends.filter(friend => friend !== uid);
        this.setState({ selectedFriends: friends });
      } else {
        this.setState({ selectedFriends: [...selectedFriends, uid] });
      }
    } else {
      Alert.alert('Sorry', 'Please ask your friend to set their username before adding them as a pal');
    }
  } 

  renderFriendsSelection() {
    const friends = [];
    if (this.state.fbFriends) {
      Object.values(this.state.fbFriends).forEach((friend, index) => {
        const selected = this.state.selectedFriends.some(uid => uid === friend.uid);
        if (!this.props.friends[friend.uid]) {
          friends.push(
            <TouchableOpacity key={friend.uid || friend.id} onPress={() => this.onFriendPress(friend)}>
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
                        style={{ color: colors.primary, marginTop: Platform.OS == 'ios' ? -2 : 0 }}
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
          Sorry we couldn't find anymore of your Facebook friends already using ActivePals
        </Text>
      </View>
    );
  }

  render() {
    return (
      <Modal
        ref="fbModal"
        onClosed={this.props.onClosed}
        isOpen={this.props.isOpen}
        style={styles.modal}
        position="center"
      >
        <Text style={{ fontSize: 20, textAlign: 'center', padding: 10 }}>Select Facebook friends</Text>
        {this.state.loading ? <PulseIndicator color={colors.secondary} /> : this.renderFriendsSelection()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 10 }}>
          <Button onPress={() => this.refs.fbModal.close()} color="red" text="Cancel" />
          <Button
            onPress={() => {
              const { length } = this.state.selectedFriends;
              if (length > 0) {
                Promise.all(
                  this.state.selectedFriends.map(friend => {
                    return this.props.request(friend);
                  })
                )
                  .then(() => {
                    this.refs.fbModal.close();
                    Alert.alert('Success', `Pal request${length > 1 ? 's' : ''} sent`);
                  })
                  .catch(e => {
                    Alert.alert('Error', e.message);
                  });
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
