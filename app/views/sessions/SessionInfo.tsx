import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
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
import globalStyles from '../../styles/globalStyles';
import styles from '../../styles/sessionStyles';
import PrivateIcon from '../../components/PrivateIcon';
import FriendsModal from '../../components/friendsModal';
import {
  removeSession,
  addUser,
  fetchSession,
  fetchPrivateSession,
  fetchGym,
} from '../../actions/sessions';
import {muteChat} from '../../actions/chats';
import SessionInfoProps from '../../types/views/sessions/SessionInfo';
import {SessionType} from '../../types/Session';
import {Icon, Text, Button, Layout, Spinner} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../../types/Shared';
import ThemedIcon from '../../components/ThemedIcon/ThemedIcon';

interface State {
  popUpVisible: boolean;
  friendsModalOpen?: boolean;
  options?: Options;
}
class SessionInfo extends Component<SessionInfoProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      popUpVisible: false,
    };
  }

  componentDidMount() {
    const {navigation, route, getPrivateSession, getSession} = this.props;
    const {isPrivate, sessionId} = route.params;
    isPrivate ? getPrivateSession(sessionId) : getSession(sessionId);
  }

  getButtons(host, session) {
    const {profile, navigation, remove, onAddUser, route} = this.props;
    const {sessionId} = route.params;
    const you = profile.uid;
    if (session.users[you]) {
      if (host.uid === you) {
        return (
          <View style={styles.infoRowSpaceEvenly}>
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
            {this.chatButton(session)}
            {/* {this.muteButton()} */}
          </View>
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
          {this.chatButton(session)}
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
  }

  handleUserPress(uid: string) {
    const {navigation, profile} = this.props;
    if (uid === profile.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('ProfileView', {uid});
    }
  }

  chatButton(session) {
    const {navigation} = this.props;
    return (
      <Button
        onPress={() =>
          navigation.navigate('Messaging', {sessionId: session.key})
        }>
        Chat
      </Button>
    );
  }

  muteButton() {
    const {muted, onMuteChat, navigation, route} = this.props;
    const {sessionId} = route.params;
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text>Mute </Text>
        <Switch
          value={muted[sessionId]}
          onValueChange={(val) => onMuteChat(sessionId, val)}
        />
      </View>
    );
  }

  renderUsers(users) {
    const {profile, friends, users: propsUsers} = this.props;
    return Object.keys(users).map((user) => {
      let userItem = friends[user] || propsUsers[user];
      if (user === profile.uid) {
        userItem = profile;
      }
      if (userItem) {
        return (
          <TouchableOpacity
            onPress={() => this.handleUserPress(user)}
            style={[
              styles.infoRowContainer,
              styles.userRow,
              {paddingVertical: userItem.avatar ? 10 : 5},
            ]}
            key={user}>
            {userItem.avatar ? (
              <Image
                source={{uri: userItem.avatar}}
                style={{height: 40, width: 40, borderRadius: 25}}
              />
            ) : (
              <ThemedIcon size={50} name="person" />
            )}
            <Text style={{marginLeft: 10}}>{userItem.username}</Text>
          </TouchableOpacity>
        );
      }
      return null;
    });
  }

  render() {
    const {
      navigation,
      sessions,
      privateSessions,
      profile,
      friends,
      users,
      places,
      location,
      route,
    } = this.props;
    const {friendsModalOpen, options, popUpVisible} = this.state;
    const {sessionId, isPrivate} = route.params;
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
        <ScrollView>
          {session ? (
            <Layout>
              <View style={{marginBottom: 20}}>
                {gym && gym.photo ? (
                  <Image
                    style={{height: 150, width: '100%'}}
                    resizeMode="cover"
                    source={{uri: gym.photo}}
                  />
                ) : (
                  <View
                    style={{
                      height: 150,
                    }}
                  />
                )}
                <View
                  style={{
                    alignSelf: 'center',
                    marginTop: -40,
                    padding: 5,
                  }}>
                  {getType(session.type, 80)}
                </View>
              </View>
              <View>
                {session && host && this.getButtons(host, session)}
                <TouchableOpacity
                  onPress={() => Alert.alert('Details', session.details)}
                  style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
                  <View>
                    <Text style={{fontSize: 18}}>Details</Text>
                    <Text numberOfLines={1} style={{color: '#999'}}>
                      {session.details}
                    </Text>
                  </View>
                  {isPrivate && <PrivateIcon />}
                  <View>
                    <Text style={{fontSize: 18}}>Gender</Text>
                    <Text style={{color: '#999'}}>{session.gender}</Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
                  <TouchableOpacity
                    style={{flex: 4}}
                    onPress={() => {
                      Alert.alert(
                        'Date and duration',
                        formatDateTime(session.dateTime) +
                          durationString(session),
                      );
                    }}>
                    <Text style={{fontSize: 18}}>Date</Text>
                    <Text numberOfLines={1} style={{color: '#999'}}>
                      {formatDateTime(session.dateTime) +
                        durationString(session)}
                    </Text>
                  </TouchableOpacity>
                  <Button
                    onPress={() => {
                      Alert.alert(`Add ${session.title} to calendar?`, '', [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Yes',
                          onPress: async () => {
                            try {
                              const result = await RNCalendarEvents.authorizeEventStore();
                              if (result === 'authorized') {
                                const calendars = await RNCalendarEvents.findCalendars();
                                const validList = calendars.filter(
                                  (calendar) => calendar.allowsModifications,
                                );
                                if (validList && validList.length > 0) {
                                  const calendarId = validList[0].id;
                                  await addSessionToCalendar(
                                    calendarId,
                                    session,
                                  );
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
                </View>
                <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Location', session.location.formattedAddress)
                    }
                    style={{flex: 5}}>
                    <Text style={{fontSize: 18}}>Location</Text>
                    <Text numberOfLines={1} style={{color: '#999'}}>
                      {session.location.formattedAddress}
                    </Text>
                  </TouchableOpacity>
                  {location && (
                    <View style={{flex: 2}}>
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
                          this.setState({
                            popUpVisible: true,
                            options: newOptions,
                          });
                        }}
                        style={{alignSelf: 'flex-end'}}>
                        Directions
                      </Button>
                    </View>
                  )}
                </View>
                {gym && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Gym', {id: gym.place_id})
                    }
                    style={[styles.infoRowContainer, styles.userRow]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                      {gym.photo ? (
                        <Image
                          source={{uri: gym.photo}}
                          style={{height: 40, width: 40, borderRadius: 25}}
                        />
                      ) : (
                        getType(SessionType.GYM, 40)
                      )}
                    </View>
                    <View>
                      <Text style={{fontSize: 18}}>Gym</Text>
                      <Text style={{color: '#999'}}>{gym.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {host && (
                  <TouchableOpacity
                    onPress={() => this.handleUserPress(host.uid)}
                    style={[
                      styles.infoRowContainer,
                      styles.userRow,
                      {paddingVertical: host.avatar ? 10 : 5},
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                      {host.avatar ? (
                        <Image
                          source={{uri: host.avatar}}
                          style={{height: 40, width: 40, borderRadius: 25}}
                        />
                      ) : (
                        <ThemedIcon size={50} name="person" />
                      )}
                    </View>
                    <View style={{marginRight: 10}}>
                      <Text style={{fontSize: 18}}>Host</Text>
                      <Text style={{color: '#999'}}>{host.username}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  marginTop: 20,
                }}>
                <View
                  style={[
                    styles.rowSpaceBetween,
                    {padding: 5, paddingHorizontal: 10},
                  ]}>
                  <Text style={{fontSize: 18}}>Users</Text>
                  {(!isPrivate || (host && profile.uid === host.uid)) && (
                    <TouchableOpacity
                      onPress={() => this.setState({friendsModalOpen: true})}>
                      <ThemedIcon
                        size={40}
                        style={{marginRight: 10}}
                        name="plus"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {session && this.renderUsers(session.users)}
              </View>
            </Layout>
          ) : (
            <Spinner />
          )}
          <Popup
            isVisible={popUpVisible}
            onCancelPressed={() => this.setState({popUpVisible: false})}
            onAppPressed={() => this.setState({popUpVisible: false})}
            onBackButtonPressed={() => this.setState({popUpVisible: false})}
            modalProps={{animationIn: 'slideInUp'}}
            options={options}
            appsWhiteList={[]}
          />
        </ScrollView>
        <FriendsModal
          title="Add Pals to Session"
          onClosed={() => this.setState({friendsModalOpen: false})}
          onContinue={async (friends) => {
            const invites = [];
            friends.forEach((friend) => {
              if (
                !Object.values(session.users).some((user) => friend === user)
              ) {
                invites.push(addUser(session.key, session.private, friend));
              }
            });
            await Promise.all(invites);
            Alert.alert(
              'Success',
              `${friends.length > 1 ? 'Pals' : 'Pal'} added`,
            );
            this.setState({friendsModalOpen: false});
          }}
          isOpen={friendsModalOpen}
        />
      </>
    );
  }
}

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
  remove: (key, type) => dispatch(removeSession(key, type)),
  onAddUser: (session, isPrivate, uid) =>
    dispatch(addUser(session, isPrivate, uid)),
  getSession: (id) => dispatch(fetchSession(id)),
  getPrivateSession: (id) => dispatch(fetchPrivateSession(id)),
  onMuteChat: (id, mute) => dispatch(muteChat(id, mute)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SessionInfo);
