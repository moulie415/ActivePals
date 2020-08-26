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
import {
  Button,
  Icon,
  Text,
  List,
  ListItem,
  Avatar,
  Layout,
} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';
import ThemedIcon from '../ThemedIcon/ThemedIcon';

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
    return (
      <List
        data={Object.values(friends)}
        renderItem={({item}) => {
          const selected = selectedFriends.some((uid) => uid === item.uid);
          if (item.status === 'connected') {
            return (
              <ListItem
                title={item.username}
                accessoryLeft={() =>
                  item.avatar ? (
                    <Avatar source={{uri: item.avatar}} />
                  ) : (
                    <ThemedIcon name="person" size={35} />
                  )
                }
                accessoryRight={() =>
                  selected ? (
                    <ThemedIcon size={25} name="checkmark-circle-2" />
                  ) : (
                    <View />
                  )
                }
              />
            );
          }
          return null;
        }}
        ListEmptyComponent={
          <Layout
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{padding: 15, textAlign: 'center'}}>
              Sorry, you must have at least one Pal to create a Private Session
            </Text>
          </Layout>
        }
      />
    );
  }

  render() {
    const {onClosed, isOpen, title, onContinue} = this.props;
    const {selectedFriends} = this.state;
    return (
      <Modal
        useNativeDriver
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

const mapStateToProps = ({friends, profile}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
});

export default connect(mapStateToProps)(FriendsModal);
