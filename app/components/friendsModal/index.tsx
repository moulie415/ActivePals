import React, {Component} from 'react';
import Modal from 'react-native-modalbox';
import {connect} from 'react-redux';
import {
  View,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Image from 'react-native-fast-image';
import styles from './styles';

import FriendsModalProps from '../../types/components/FriendsModal';
import {Button, Icon, Text} from '@ui-kitten/components';

interface State {
  selectedFriends: string[];
}
class FriendsModal extends Component<FriendsModalProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedFriends: [],
    };
  }

  onFriendPress(uid) {
    const {selectedFriends} = this.state;
    if (selectedFriends.some((friend) => friend === uid)) {
      const friends = selectedFriends.filter((friend) => friend !== uid);
      this.setState({selectedFriends: friends});
    } else {
      this.setState({selectedFriends: [...selectedFriends, uid]});
    }
  }

  renderFriendsSelection() {
    const {friends} = this.props;
    const {selectedFriends} = this.state;
    const connectedFriends = [];
    Object.values(friends).forEach((friend, index) => {
      const selected = selectedFriends.some((uid) => uid === friend.uid);
      if (friend.status === 'connected') {
        connectedFriends.push(
          <TouchableOpacity
            key={friend.uid}
            onPress={() => this.onFriendPress(friend.uid)}>
            <View
              style={{
                backgroundColor: '#fff',
                paddingVertical: 15,
                paddingHorizontal: 10,
                marginBottom: 0.5,
                marginTop: index === 0 ? 0.5 : 0,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 30,
                  justifyContent: 'space-between',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  <Text style={{marginHorizontal: 10}}>{friend.username}</Text>
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
                </View>
              </View>
            </View>
          </TouchableOpacity>,
        );
      }
    });
    return connectedFriends.length > 0 ? (
      <ScrollView style={{backgroundColor: '#d6d6d6'}}>
        {connectedFriends}
      </ScrollView>
    ) : (
      <View
        style={{
          backgroundColor: '#fff',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{padding: 15, textAlign: 'center'}}>
          Sorry, you must have at least one Pal to create a Private Session
        </Text>
      </View>
    );
  }

  render() {
    const {onClosed, isOpen, title, onContinue} = this.props;
    const {selectedFriends} = this.state;
    return (
      <Modal
        onClosed={onClosed}
        isOpen={isOpen}
        style={styles.modal}
        position="center"
        key={isOpen ? 1 : 2}>
        <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
          {title || 'Select Pals'}
        </Text>
        {this.renderFriendsSelection()}
        <View
          style={{
            marginVertical: 10,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          <Button onPress={onClosed} status="danger">
            Cancel
          </Button>
          <Button
            onPress={() => {
              const {length} = selectedFriends;
              if (length > 0) {
                onContinue(selectedFriends);
              } else {
                Alert.alert('Sorry', 'Please select at least one friend');
              }
            }}>
            Continue
          </Button>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = ({friends, profile}) => ({
  friends: friends.friends,
  profile: profile.profile,
});

export default connect(mapStateToProps)(FriendsModal);
