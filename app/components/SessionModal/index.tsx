import React, {FunctionComponent} from 'react';
import Modal from 'react-native-modalbox';
import {View, TouchableOpacity, ScrollView, Alert} from 'react-native';
import database from '@react-native-firebase/database';
import Hyperlink from 'react-native-hyperlink';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from '../Text';

import PrivateIcon from '../PrivateIcon';
import {getDistance, formatDateTime} from '../../constants/utils';
import Button from '../Button';
import styles from './styles';
import SessionModalProps from '../../types/components/SessionModal';

const SessionModal: FunctionComponent<SessionModalProps> = ({
  session,
  disabled,
  profile,
  viewSession,
  viewGym,
  location,
  openChat,
  friends,
  viewDirections,
  viewProfile,
  join,
  remove,
  close,
  users,
}) => {
  const fetchHost = (host: string, uid: string) => {
    if (host === uid) {
      return <Text style={{fontWeight: 'bold'}}>You</Text>;
    }
    if (friends[host]) {
      return (
        <TouchableOpacity onPress={() => viewProfile(host)}>
          <Text>{friends[host].username}</Text>
        </TouchableOpacity>
      );
    }
    if (users[host]) {
      return (
        <TouchableOpacity onPress={() => viewProfile(host)}>
          <Text>{users[host].username}</Text>
        </TouchableOpacity>
      );
    }
    return <Text>N/A</Text>;
  };

  const fetchButtons = (uid: string) => {
    if (session.users[uid]) {
      if (session.host === uid) {
        return (
          <Button
            onPress={() => {
              Alert.alert('Delete session', 'Are you sure?', [
                {text: 'cancel', style: 'cancel'},
                {
                  text: 'Yes',
                  onPress: () => {
                    remove(session.key, session.private);
                    close();
                  },
                  style: 'destructive',
                },
              ]);
            }}
            style={{alignSelf: 'center'}}
            status="danger">
            Delete
          </Button>
        );
      } else {
        return (
          <Button
            status="danger"
            style={{alignSelf: 'center'}}
            onPress={() => {
              remove(session.key, session.private);
              close();
            }}>
            Leave
          </Button>
        );
      }
    } else {
      return (
        <Button
          style={{alignSelf: 'center'}}
          onPress={async () => {
            await database()
              .ref(`userSession/${uid}`)
              .child(session.key)
              .set(true);
            join(session.key, session.private);
            database()
              .ref(`sessions/${session.key}/users`)
              .child(uid)
              .set(true);
            close();
            Alert.alert(
              'Session joined',
              'You should now see this session in your session chats',
            );
          }}
        >Join</Button>
      );
    }
  };

  return (
    <Modal style={styles.modal} position="center" isDisabled={disabled}>
      {session && (
        <View style={{flex: 1}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
            <Text
              style={{
                fontSize: 20,
                textAlign: 'center',
                padding: 10,
                color: '#000',
              }}>
              {session.title}
            </Text>
            <TouchableOpacity
              onPress={() => viewSession(session.key, session.private)}>
              <Icon
                size={40}
                name="md-information-circle"
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={{margin: 10}}>
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View style={{flexDirection: 'row'}}>
                <Text style={{color: '#999'}}>Host: </Text>
                {fetchHost(session.host, profile.uid)}
              </View>
              {session.users[profile.uid] && (
                <TouchableOpacity onPress={() => openChat(session)}>
                  <Icon
                    size={25}
                    name="md-chatboxes"
                    style={{ paddingHorizontal: 10}}
                  />
                </TouchableOpacity>
              )}
              {session.private && <PrivateIcon />}
            </View>
            <Hyperlink linkDefault>
              <Text style={{marginVertical: 5, color: '#999'}}>
                Details: <Text style={{color: '#000'}}>{session.details}</Text>
              </Text>
            </Hyperlink>
            <Text style={{marginVertical: 5, color: '#000'}}>
              {`${formatDateTime(session.dateTime)} for ${session.duration} ${
                session.duration > 1 ? 'hours' : 'hour'
              }`}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                marginVertical: 5,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{flex: 1}}>
                <Text style={{color: '#000'}}>
                  {session.location.formattedAddress}
                </Text>
                <Text style={{color: '#999'}}>
                  {` (${
                    session.distance
                      ? session.distance.toFixed(2)
                      : getDistance(
                          session,
                          location.lat,
                          location.lon,
                        ).toFixed(2)
                  } km away)`}
                </Text>
              </Text>
              <Button
                onPress={() => {
                  const {lat, lng} = session.location.position;
                  const options = {
                    latitude: lat,
                    longitude: lng,
                    cancelText: 'Cancel',
                    sourceLatitude: location.lat,
                    sourceLongitude: location.lon,
                  };
                  viewDirections(options);
                }}
                style={{marginLeft: 10}}
                text="Directions"
              />
            </View>
            {session.gym && (
              <TouchableOpacity onPress={() => viewGym(session.gym)}>
                <Text style={{color: '#999', marginVertical: 10}}>
                  Gym:{' '}
                  <Text style={{ fontWeight: 'bold'}}>
                    {session.gym}
                  </Text>
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View style={{justifyContent: 'flex-end', flex: 1, margin: 10}}>
            {fetchButtons(profile.uid)}
          </View>
        </View>
      )}
    </Modal>
  );
};

export default SessionModal;
