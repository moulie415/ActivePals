import React, {FunctionComponent, useState, useEffect} from 'react';
import {pathOr} from 'ramda';
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image as SlowImage,
} from 'react-native';
import Image from 'react-native-fast-image';
import {Popup, Options} from 'react-native-map-link';
import {connect} from 'react-redux';
import hStyles from '../styles/homeStyles';
import {getDistance} from '../constants/utils';
import FriendsModal from '../components/friendsModal';
import styles from '../styles/gymStyles';
import {removeGym, joinGym} from '../actions/profile';
import {fetchGym} from '../actions/sessions';
import {muteChat} from '../actions/chats';
import GymProps from '../types/views/Gym';
import {
  Button,
  Text,
  Layout,
  Spinner,
  List,
  Divider,
  ListItem,
} from '@ui-kitten/components';
import {MyRootState, MyThunkDispatch} from '../types/Shared';
import ThemedIcon from '../components/ThemedIcon/ThemedIcon';
import ThemedImage from '../components/ThemedImage/ThemedImage';

const Gym: FunctionComponent<GymProps> = ({
  route,
  getGym,
  profile,
  navigation,
  users: currentUsers,
  friends,
  places,
  location,
  gym: yourGym,
  join,
  removeYourGym,
}) => {
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [options, setOptions] = useState<Options>();
  const {id} = route.params;

  useEffect(() => {
    getGym(id);
  }, [getGym, id]);

  const handleUserPress = (uid: string) => {
    if (uid === profile.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('ProfileView', {uid});
    }
  };

  const renderUsers = (users) => {
    return (
      <List
        ItemSeparatorComponent={Divider}
        keyExtractor={(item) => item}
        data={Object.keys(users)}
        renderItem={({item}) => {
          let userItem = friends[item] || currentUsers[item];
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

  const gym = places[id];
  const yourLat = pathOr(null, ['lat'], location);
  const yourLon = pathOr(null, ['lon'], location);
  const distance = gym
    ? getDistance(gym, yourLat, yourLon, true).toFixed(2)
    : '';
  const distanceString = location ? `(${distance} km away)` : '';
  const locationString = gym ? `${gym.vicinity} ${distanceString}` : '';
  return (
    <>
      {gym ? (
        <Layout style={{flex: 1}}>
          <ScrollView>
            <View style={{alignItems: 'center', marginBottom: 20}}>
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
                    width: '100%',
                    justifyContent: 'center',
                  }}
                />
              )}
              <View>
                <Layout>
                  <ThemedImage
                    style={{
                      padding: 10,
                      marginTop: -40,
                    }}
                    size={80}
                    source={require('../../assets/images/dumbbell.png')}
                  />
                </Layout>
              </View>
              <Text style={{textAlign: 'center'}} category="h4">
                {gym.name}
              </Text>
            </View>
            <Divider />
            <View>
              {yourGym && yourGym.place_id === id ? (
                <View
                  style={[styles.infoRowContainer, styles.infoRowSpaceEvenly]}>
                  <Button
                    onPress={() => {
                      Alert.alert('Leave', 'Are you sure?', [
                        {text: 'Cancel', style: 'cancel'},
                        {
                          text: 'Yes',
                          onPress: () => removeYourGym(),
                          style: 'destructive',
                        },
                      ]);
                    }}
                    style={{alignSelf: 'flex-start'}}
                    status="danger">
                    Leave
                  </Button>
                  <Button
                    onPress={() =>
                      navigation.navigate('Messaging', {gymId: gym.place_id})
                    }
                    style={{justifyContent: 'center'}}>
                    Chat
                  </Button>
                  {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Text>Mute </Text>
                      <Switch
                      value={this.props.muted[this.id]}
                      onValueChange={(val) => this.props.muteChat(this.id, val)} />
                      </View> */}
                </View>
              ) : (
                <View style={styles.infoRowContainer}>
                  <Button
                    onPress={() => {
                      if (yourGym) {
                        Alert.alert(
                          'Join',
                          'This will leave your current Gym?',
                          [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Yes', onPress: () => join(gym)},
                          ],
                        );
                      } else {
                        join(gym);
                      }
                    }}
                    style={{alignSelf: 'center'}}>
                    Join
                  </Button>
                </View>
              )}
              <Divider />
              <ListItem
                onPress={() => Alert.alert(gym.name, locationString)}
                title="Location"
                description={gym.vicinity ? locationString : ''}
                accessoryRight={() => (
                  <Button
                    onPress={() => {
                      const {lat, lng} = gym.geometry.location;
                      const {place_id} = gym;
                      const popupOptions = {
                        latitude: lat,
                        longitude: lng,
                        cancelText: 'Cancel',
                        sourceLatitude: location.lat,
                        sourceLongitude: location.lon,
                        googlePlaceId: place_id,
                      };
                      setPopUpVisible(true);
                      setOptions(popupOptions);
                    }}>
                    Directions
                  </Button>
                )}
              />
              <Divider />
              {!!gym.website && (
                <>
                  <ListItem
                    onPress={() =>
                      Linking.openURL(gym.website).catch((e) =>
                        Alert.alert('Error', e.message),
                      )
                    }
                    title="Website"
                    description={gym.website}
                  />
                  <Divider />
                </>
              )}
              {!!gym.rating && (
                <>
                  <ListItem
                    title="Google rating"
                    description={gym.rating.toFixed(2)}
                    accessoryRight={() =>
                      gym.user_ratings_total ? (
                        <Text>
                          {` from ${gym.user_ratings_total} ${
                            gym.user_ratings_total > 1 ? 'ratings' : 'rating'
                          }`}
                        </Text>
                      ) : (
                        <View />
                      )
                    }
                  />
                  <Divider />
                </>
              )}
              {!!gym.formatted_phone_number ||
                (!!gym.international_phone_number && (
                  <>
                    <ListItem
                      accessoryLeft={() =>
                        gym.formatted_phone_number ? (
                          <TouchableOpacity
                            onPress={() => {
                              Linking.openURL(
                                `tel:${gym.formatted_phone_number}`,
                              ).catch((e) => Alert.alert('Error', e.message));
                            }}>
                            <Text style={{fontSize: 18}}>Phone number</Text>
                            <Text style={{color: '#999'}}>
                              {gym.formatted_phone_number}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View />
                        )
                      }
                      accessoryRight={() =>
                        gym.international_phone_number ? (
                          <TouchableOpacity
                            onPress={() => {
                              Linking.openURL(
                                `tel:${gym.international_phone_number}`,
                              ).catch((e) => Alert.alert('Error', e.message));
                            }}>
                            <Text style={{fontSize: 18}}>
                              Intl phone number
                            </Text>
                            <Text style={{color: '#999'}}>
                              {gym.international_phone_number}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View />
                        )
                      }
                    />
                    <Divider />
                  </>
                ))}
              {gym.opening_hours && gym.opening_hours.weekday_text && (
                <>
                  <ListItem
                    onPress={() =>
                      Alert.alert(
                        'Opening hours',
                        gym.opening_hours.weekday_text.join('\n'),
                      )
                    }
                    title="Opening hours"
                    description="Touch to see opening hours"
                  />
                  <Divider />
                </>
              )}
            </View>
            {gym && gym.users && (
              <View>
                <View style={[styles.rowSpaceBetween, {padding: 10}]}>
                  <Text style={{fontSize: 18}}>Users</Text>
                </View>
                <Divider />
                {renderUsers(gym.users)}
              </View>
            )}
          </ScrollView>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
            }}>
            <Button
              style={{
                flex: 1,
                marginLeft: 5,
                marginRight: 2,
                paddingVertical: 15,
              }}
              onPress={() =>
                navigation.navigate('SessionDetail', {location: gym})
              }>
              Create Session
            </Button>
            <View
              style={{borderRightWidth: 1, borderRightColor: 'transparent'}}
            />
            <Button
              style={{
                flex: 1,
                marginRight: 5,
                marginLeft: 2,
                paddingVertical: 15,
              }}
              onPress={() => setFriendsModalOpen(true)}>
              Create Private Session
            </Button>
          </View>
        </Layout>
      ) : (
        <View style={hStyles.spinner}>
          <Spinner />
        </View>
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
        onClosed={() => setFriendsModalOpen(false)}
        onContinue={(friends) => {
          setFriendsModalOpen(false);
          navigation.navigate('SessionDetail', {friends, location: gym});
        }}
        isOpen={friendsModalOpen}
      />
    </>
  );
};

const mapStateToProps = ({
  friends,
  sharedInfo,
  profile,
  sessions,
  chats,
}: MyRootState) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  location: profile.location,
  places: sessions.places,
  muted: chats.muted,
});

const mapDispatchToProps = (dispatch: MyThunkDispatch) => ({
  join: (location) => dispatch(joinGym(location)),
  removeYourGym: () => dispatch(removeGym()),
  getGym: (id: string) => dispatch(fetchGym(id)),
  muteChat: (id: string, mute: boolean) => dispatch(muteChat(id, mute)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Gym);
