import React, {FunctionComponent, useEffect, useState} from 'react';
import {View, TouchableOpacity, Alert, ScrollView} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import Image from 'react-native-fast-image';
import {connect} from 'react-redux';
import {Popup, Options} from 'react-native-map-link';
import {
  getType,
  formatDateTime,
  addSessionToCalendar,
  durationString,
} from '../../constants/utils';
import styles from '../../styles/sessionStyles';
import FriendsModal from '../../components/friendsModal';
import {
  removeSession,
  addUser,
  fetchSession,
  fetchPrivateSession,
} from '../../actions/sessions';
import {muteChat} from '../../actions/chats';
import SessionInfoProps from '../../types/views/sessions/SessionInfo';
import {SessionType} from '../../types/Session';
import {
  Text,
  Button,
  Layout,
  Spinner,
  ListItem,
  Toggle,
  Divider,
  List,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';
import hStyles from '../../styles/homeStyles';

const SessionInfo: FunctionComponent<SessionInfoProps> = ({
  route,
  getPrivateSession,
  getSession,
  profile,
  remove,
  onAddUser,
  navigation,
  muted,
  onMuteChat,
  users: propsUsers,
  sessions,
  privateSessions,
  friends,
  users,
  places,
  location,
}) => {
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [options, setOptions] = useState<Options>();
  const {isPrivate, sessionId} = route.params;

  useEffect(() => {
    if (isPrivate) {
      getPrivateSession(sessionId);
    } else {
      getSession(sessionId);
    }
  }, [getPrivateSession, getSession, isPrivate, sessionId]);

  const getButtons = (host, session) => {
    const you = profile.uid;
    if (session.users[you]) {
      if (host.uid === you) {
        return (
          <Layout style={styles.infoRowSpaceEvenly}>
            <Button
              onPress={() => {
                Alert.alert('Delete session', 'Are you sure?', [
                  {text: 'cancel', style: 'cancel'},
                  {
                    text: 'Yes',
                    onPress: () => {
                      remove(sessionId, session.private);
                      navigation.goBack();
                    },
                    style: 'destructive',
                  },
                ]);
              }}
              style={{alignSelf: 'center'}}
              status="danger">
              Delete
            </Button>
            {chatButton(session)}
            {/* {this.muteButton()} */}
          </Layout>
        );
      }
      return (
        <View style={styles.infoRowSpaceEvenly}>
          <Button
            status="danger"
            style={{alignSelf: 'center'}}
            onPress={() => {
              remove(sessionId, session.private);
              navigation.goBack();
            }}>
            Leave
          </Button>
          {chatButton(session)}
          {/* {this.muteButton()} */}
        </View>
      );
    }
    return (
      <View style={styles.infoRowSpaceEvenly}>
        <Button
          style={{alignSelf: 'center'}}
          onPress={async () => {
            try {
              await onAddUser(sessionId, session.private, profile.uid);
              Alert.alert(
                'Session joined',
                'You should now see this session in your session chats',
              );
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }}>
          Join
        </Button>
      </View>
    );
  };

  const handleUserPress = (uid: string) => {
    if (uid === profile.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('ProfileView', {uid});
    }
  };

  const chatButton = (session) => {
    return (
      <Button
        onPress={() =>
          navigation.navigate('Messaging', {sessionId: session.key})
        }>
        Chat
      </Button>
    );
  };

  const muteButton = () => {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text>Mute </Text>
        <Toggle
          checked={muted[sessionId]}
          onChange={(val) => onMuteChat(sessionId, val)}
        />
      </View>
    );
  };

  const renderUsers = (users) => {
    return (
      <List
        ItemSeparatorComponent={Divider}
        keyExtractor={(item) => item}
        data={Object.keys(users)}
        renderItem={({item}) => {
          let userItem = friends[item] || propsUsers[item];
          if (item === profile.uid) {
            userItem = profile;
          }
          if (userItem) {
            return (
              <ListItem
                onPress={() => handleUserPress(item)}
                title={userItem.username}
                accessoryLeft={() =>
                  userItem.avatar ? (
                    <Image
                      source={{uri: userItem.avatar}}
                      style={{height: 40, width: 40, borderRadius: 25}}
                    />
                  ) : (
                    <ThemedIcon size={50} name="person" />
                  )
                }
              />
            );
          }
          return null;
        }}
      />
    );
  };

  const session = sessions[sessionId] || privateSessions[sessionId];
  let host;
  if (session && session.host === profile.uid) {
    host = profile;
  } else if (session && session.host) {
    host = friends[session.host] || users[session.host];
  }
  let gym;
  if (session && session.gym) {
    gym = places[session.gym];
  }

  return (
    <>
      {session ? (
        <Layout style={{flex: 1}}>
          <ScrollView>
            <Layout style={{marginBottom: 20}}>
              {gym && gym.photo ? (
                <Image
                  style={{height: 150, width: '100%'}}
                  resizeMode="cover"
                  source={{uri: gym.photo}}
                />
              ) : (
                <Layout
                  style={{
                    height: 150,
                  }}
                />
              )}
              <Layout
                style={{
                  alignSelf: 'center',
                  marginTop: -40,
                  padding: 5,
                }}>
                {getType(session.type, 80)}
              </Layout>
              <Text style={{textAlign: 'center'}} category="h4">
                {session.title}
              </Text>
              <Text style={{textAlign: 'center'}} category="h6">
                {session.private ? '(private)' : ''}
              </Text>
            </Layout>

            <Divider />
            {session && host && getButtons(host, session)}
            <Divider />

            <ListItem
              onPress={() => Alert.alert('Details', session.details)}
              title="Details"
              description={session.details}
            />
            <Divider />
            <ListItem
              onPress={() => {
                Alert.alert(
                  'Date and duration',
                  formatDateTime(session.dateTime) + durationString(session),
                );
              }}
              title="Date"
              description={
                formatDateTime(session.dateTime) + durationString(session)
              }
              accessoryRight={() => (
                <Button
                  onPress={() => {
                    Alert.alert(`Add ${session.title} to calendar?`, '', [
                      {text: 'Cancel', style: 'cancel'},
                      {
                        text: 'Yes',
                        onPress: async () => {
                          try {
                            const result = await RNCalendarEvents.requestPermissions();
                            if (result === 'authorized') {
                              const calendars = await RNCalendarEvents.findCalendars();
                              const validList = calendars.filter(
                                (calendar) => calendar.allowsModifications,
                              );
                              if (validList && validList.length > 0) {
                                const calendarId = validList[0].id;
                                await addSessionToCalendar(calendarId, session);
                                Alert.alert(
                                  'Success',
                                  `${session.title} saved to calendar`,
                                );
                              } else {
                                Alert.alert(
                                  'Sorry',
                                  "You don't have any calendars that allow modification",
                                );
                              }
                            }
                          } catch (e) {
                            Alert.alert('Error', e.message);
                          }
                        },
                      },
                    ]);
                  }}>
                  Add to calendar
                </Button>
              )}
            />
            <Divider />
            <ListItem
              onPress={() =>
                Alert.alert('Location', session.location.formattedAddress)
              }
              title="Location"
              description={session.location.formattedAddress}
              accessoryRight={() =>
                location ? (
                  <Button
                    onPress={() => {
                      const {lat, lng} = session.location.position;
                      const newOptions: Options = {
                        latitude: lat,
                        longitude: lng,
                        cancelText: 'Cancel',
                        sourceLatitude: location.lat,
                        sourceLongitude: location.lon,
                      };
                      setPopUpVisible(true);
                      setOptions(newOptions);
                    }}>
                    Directions
                  </Button>
                ) : (
                  <Layout />
                )
              }
            />
            <Divider />
            {gym && (
              <ListItem
                onPress={() => navigation.navigate('Gym', {id: gym.place_id})}
                accessoryLeft={() =>
                  gym.photo ? (
                    <Image
                      source={{uri: gym.photo}}
                      style={{height: 40, width: 40, borderRadius: 25}}
                    />
                  ) : (
                    getType(SessionType.GYM, 40)
                  )
                }
                title="Gym"
                description={gym.name}
              />
            )}
            <Divider />
            {host && (
              <ListItem
                onPress={() => handleUserPress(host.uid)}
                accessoryLeft={() =>
                  host.avatar ? (
                    <Image
                      source={{uri: host.avatar}}
                      style={{height: 40, width: 40, borderRadius: 25}}
                    />
                  ) : (
                    <ThemedIcon size={50} name="person" />
                  )
                }
                title="Host"
                description={host.username}
              />
            )}
            <Layout>
              <Divider />
              <Layout
                style={[
                  styles.rowSpaceBetween,
                  {padding: 5, paddingHorizontal: 10},
                ]}>
                <Text style={{fontSize: 18}}>Users</Text>

                {(!isPrivate || (host && profile.uid === host.uid)) && (
                  <TouchableOpacity onPress={() => setFriendsModalOpen(true)}>
                    <ThemedIcon
                      size={40}
                      style={{marginRight: 10}}
                      name="plus"
                    />
                  </TouchableOpacity>
                )}
              </Layout>
              <Divider />
              {session && renderUsers(session.users)}
            </Layout>
          </ScrollView>
        </Layout>
      ) : (
        <Layout style={hStyles.spinner}>
          <Spinner />
        </Layout>
      )}
      <Popup
        isVisible={popUpVisible}
        onCancelPressed={() => setPopUpVisible(false)}
        onAppPressed={() => setPopUpVisible(false)}
        onBackButtonPressed={() => setPopUpVisible(false)}
        modalProps={{animationIn: 'slideInUp'}}
        options={options}
        appsWhiteList={[]}
      />
      <FriendsModal
        title="Add Pals to Session"
        onClosed={() => setFriendsModalOpen(false)}
        onContinue={async (friends) => {
          const invites = [];
          friends.forEach((friend) => {
            if (!Object.values(session.users).some((user) => friend === user)) {
              invites.push(addUser(session.key, session.private, friend));
            }
          });
          await Promise.all(invites);
          Alert.alert(
            'Success',
            `${friends.length > 1 ? 'Pals' : 'Pal'} added`,
          );
          setFriendsModalOpen(false);
        }}
        isOpen={friendsModalOpen}
      />
    </>
  );
};

const mapStateToProps = ({
  profile,
  sharedInfo,
  friends,
  sessions,
  chats,
}: MyRootState) => ({
  profile: profile.profile,
  users: sharedInfo.users,
  friends: friends.friends,
  location: profile.location,
  places: sessions.places,
  sessions: sessions.sessions,
  privateSessions: sessions.privateSessions,
  muted: chats.muted,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  remove: (key: string, isPrivate: boolean) =>
    dispatch(removeSession(key, isPrivate)),
  onAddUser: (session: string, isPrivate: boolean, uid: string) =>
    dispatch(addUser(session, isPrivate, uid)),
  getSession: (id: string) => dispatch(fetchSession(id)),
  getPrivateSession: (id: string) => dispatch(fetchPrivateSession(id)),
  onMuteChat: (id: string, mute: boolean) => dispatch(muteChat(id, mute)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfo);
