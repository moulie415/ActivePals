import React, {FunctionComponent, useState} from 'react';
import {connect} from 'react-redux';
import {View, Alert} from 'react-native';
import styles from './styles';
import FriendsModalProps from '../../types/components/FriendsModal';
import {
  Button,
  Text,
  List,
  ListItem,
  Layout,
  Modal,
  Card,
  Divider,
} from '@ui-kitten/components';
import {MyRootState} from '../../types/Shared';
import ThemedIcon from '../ThemedIcon/ThemedIcon';
import globalStyles from '../../styles/globalStyles';
import Avatar from '../Avatar/Avatar';

const FriendsModal: FunctionComponent<FriendsModalProps> = ({
  onClosed,
  onContinue,
  isOpen,
  friends,
  title,
}) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const onFriendPress = (uid: string) => {
    if (selectedFriends.some((friend) => friend === uid)) {
      const friends = selectedFriends.filter((friend) => friend !== uid);
      setSelectedFriends(friends);
    } else {
      setSelectedFriends([...selectedFriends, uid]);
    }
  };

  const renderFriendsSelection = () => {
    return (
      <List
        ItemSeparatorComponent={Divider}
        data={Object.values(friends)}
        renderItem={({item}) => {
          const selected = selectedFriends.some((uid) => uid === item.uid);
          if (item.status === 'connected') {
            return (
              <ListItem
                onPress={() => onFriendPress(item.uid)}
                title={item.username}
                accessoryLeft={() =>
                  item.avatar ? (
                    <Avatar uri={item.avatar} size={35} />
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
  };

  return (
    <Modal
      visible={isOpen}
      backdropStyle={globalStyles.backdrop}
      onBackdropPress={onClosed}
      style={styles.modal}>
      <Card disabled>
        <Text style={{fontSize: 20, textAlign: 'center', padding: 10}}>
          {title || 'Select Pals'}
        </Text>
        <Divider />
        {renderFriendsSelection()}
        <Divider />
        <Layout
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
        </Layout>
      </Card>
    </Modal>
  );
};

const mapStateToProps = ({friends, profile}: MyRootState) => ({
  friends: friends.friends,
  profile: profile.profile,
});

export default connect(mapStateToProps)(FriendsModal);
