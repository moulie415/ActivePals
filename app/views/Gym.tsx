import React, {Component} from 'react';
import {pathOr} from 'ramda';
import {
  Alert,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image as SlowImage,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Image from 'react-native-fast-image';
import Hyperlink from 'react-native-hyperlink';
import {Popup, Options} from 'react-native-map-link';
import {connect} from 'react-redux';
import {PulseIndicator} from 'react-native-indicators';
import Text from '../components/Text';
import hStyles from '../styles/homeStyles';

import {getDistance} from '../constants/utils';
import Header from '../components/Header/header';
import globalStyles from '../styles/globalStyles';
import FriendsModal from '../components/friendsModal';
import Button from '../components/Button';
import styles from '../styles/gymStyles';
import {removeGym, joinGym} from '../actions/profile';
import {fetchGym} from '../actions/sessions';
import {muteChat} from '../actions/chats';
import GymProps from '../types/views/Gym';
import Profile from '../types/Profile';

interface State {
  profile?: Profile;
  popUpVisible: boolean;
  friendsModalOpen?: boolean;
  options?: Options;
}

class Gym extends Component<GymProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      popUpVisible: false,
    };
  }

  componentDidMount() {
    const {navigation, getGym} = this.props;
    const {params} = navigation.state;
    getGym(params.id);
  }

  static navigationOptions = {
    headerShown: false,
    tabBarLabel: 'Gym',
  };

  handleUserPress(uid) {
    const {profile, navigation} = this.props;
    if (uid === profile.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('ProfileView', {uid});
    }
  }

  renderUsers(users) {
    const {users: currentUsers, friends, profile} = this.props;
    return Object.keys(users).map((user) => {
      let userItem = friends[user] || currentUsers[user];
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
              <Icon size={50} name="md-contact" />
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
      places,
      location,
      navigation,
      gym: yourGym,
      join,
      removeYourGym,
    } = this.props;
    const {
      params: {id},
    } = navigation.state;
    const {popUpVisible, options, friendsModalOpen} = this.state;
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
        <Header hasBack title={gym && gym.name} />
        {gym ? (
          <View style={{flex: 1}}>
            <ScrollView style={{backgroundColor: '#9993'}}>
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
                <View style={globalStyles.shadow}>
                  <SlowImage
                    style={{
                      width: 80,
                      padding: 10,
                      height: 80,
                      marginTop: -40,
                      borderWidth: 1,
                      backgroundColor: '#fff',
                    }}
                    source={require('../../assets/images/dumbbell.png')}
                  />
                </View>
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  ...globalStyles.sectionShadow,
                }}>
                {yourGym && yourGym.place_id === id ? (
                  <View
                    style={[
                      styles.infoRowContainer,
                      styles.infoRowSpaceEvenly,
                    ]}>
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
                      style={{alignSelf: 'center'}}
                      text="Join"
                    />
                  </View>
                )}
                <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
                  <View style={{flex: 4}}>
                    <Text style={{fontSize: 18}}>Location</Text>
                    {gym.vicinity && (
                      <TouchableOpacity
                        onPress={() => Alert.alert(gym.name, locationString)}>
                        <Text numberOfLines={1} style={{color: '#999'}}>
                          {locationString}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
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
                      this.setState({
                        popUpVisible: true,
                        options: popupOptions,
                      });
                    }}
                    style={{
                      marginLeft: 20,
                      marginRight: 10,
                      alignSelf: 'flex-start',
                    }}
                    text="Directions"
                  />
                </View>
                {gym.website && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(gym.website).catch((e) =>
                        Alert.alert('Error', e.message),
                      )
                    }
                    style={styles.infoRowContainer}>
                    <Text style={{fontSize: 18}}>Website</Text>
                    <Hyperlink linkDefault>
                      <Text
                        numberOfLines={1}
                        style={{
                          textDecorationLine: 'underline',
                        }}>
                        {gym.website}
                      </Text>
                    </Hyperlink>
                  </TouchableOpacity>
                )}
                {gym.rating && (
                  <View style={styles.infoRowContainer}>
                    <Text style={{fontSize: 18}}>Google rating</Text>
                    <Text style={{color: '#999'}}>
                      <Text>{gym.rating.toFixed(2)}</Text>
                      {gym.user_ratings_total && (
                        <Text>
                          {` from ${gym.user_ratings_total} ${
                            gym.user_ratings_total > 1 ? 'ratings' : 'rating'
                          }`}
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
                <View style={[styles.infoRowContainer, styles.rowSpaceBetween]}>
                  {gym.formatted_phone_number && (
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
                  )}
                  {gym.international_phone_number && (
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(
                          `tel:${gym.international_phone_number}`,
                        ).catch((e) => Alert.alert('Error', e.message));
                      }}>
                      <Text style={{fontSize: 18}}>Intl phone number</Text>
                      <Text style={{color: '#999'}}>
                        {gym.international_phone_number}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {gym.opening_hours && gym.opening_hours.weekday_text && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Opening hours',
                        gym.opening_hours.weekday_text.join('\n'),
                      )
                    }
                    style={styles.infoRowContainer}>
                    <Text style={{fontSize: 18}}>Opening hours</Text>
                    <Text style={{color: '#999'}}>
                      Touch to see opening hours
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {gym && gym.users && (
                <View
                  style={{
                    backgroundColor: '#fff',
                    ...globalStyles.sectionShadow,
                    marginTop: 20,
                  }}>
                  <View style={[styles.rowSpaceBetween, {padding: 10}]}>
                    <Text style={{fontSize: 18}}>Users</Text>
                  </View>
                  {this.renderUsers(gym.users)}
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
                text="Create Session"
                textStyle={{textAlign: 'center'}}
                onPress={() =>
                  navigation.navigate('SessionDetail', {location: gym})
                }
              />
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
                textStyle={{textAlign: 'center'}}
                text="Create Private Session"
                onPress={() => this.setState({friendsModalOpen: true})}
              />
            </View>
          </View>
        ) : (
          <View style={hStyles.spinner}>
            <ActivityIndicator />
          </View>
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
        <FriendsModal
          onClosed={() => this.setState({friendsModalOpen: false})}
          onContinue={(friends) =>
            navigation.navigate('SessonDetail', {friends, location: gym})
          }
          isOpen={friendsModalOpen}
        />
      </>
    );
  }
}

const mapStateToProps = ({friends, sharedInfo, profile, sessions, chats}) => ({
  friends: friends.friends,
  users: sharedInfo.users,
  profile: profile.profile,
  gym: profile.gym,
  location: profile.location,
  places: sessions.places,
  muted: chats.muted,
});

const mapDispatchToProps = (dispatch) => ({
  join: (location) => dispatch(joinGym(location)),
  removeYourGym: () => dispatch(removeGym()),
  getGym: (id) => dispatch(fetchGym(id)),
  muteChat: (id, mute) => dispatch(muteChat(id, mute)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Gym);
