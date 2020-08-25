import React from 'react';
import Modal from 'react-native-modalbox';
import Image from 'react-native-fast-image';
import {View, TouchableOpacity, Alert} from 'react-native';
import {connect} from 'react-redux';
import {getDistance} from '../../constants/utils';
import styles from './styles';
import {MyRootState} from '../../types/Shared';

const GymModal = (
  gym,
  location,
  yourGym,
  onOpenGymChat,
  removeGym,
  join,
  openPopUp,
  viewGym,
  openFriends,
  onContinue,
  close,
) => {
  const {vicinity, name, geometry, place_id, photo} = gym;
  return (
    <Modal style={[styles.modal, {height: null}]} position="center">
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
          <Text style={{fontSize: 20, padding: 10, color: '#000'}}>{name}</Text>
          <TouchableOpacity onPress={() => viewGym(place_id)}>
            <Icon size={40} name="md-information-circle" />
          </TouchableOpacity>
        </View>
        <View style={{margin: 10}}>
          <View
            style={{
              flexDirection: 'row',
              marginVertical: 10,
              justifyContent: 'space-between',
            }}>
            <View style={{flex: 1}}>
              <Text>
                <Text>{vicinity}</Text>
                <Text style={{color: '#999'}}>
                  {` (${getDistance(
                    gym,
                    location.lat,
                    location.lon,
                    true,
                  ).toFixed(2)} km away)`}
                </Text>
              </Text>
            </View>
            <Button
              onPress={() => {
                const {lat, lng} = geometry && geometry.location;
                const options = {
                  latitude: lat,
                  longitude: lng,
                  cancelText: 'Cancel',
                  sourceLatitude: location.latitude,
                  sourceLongitude: location.longitude,
                  googlePlaceId: place_id,
                };
                openPopUp(options);
              }}
              style={{marginLeft: 10, alignSelf: 'flex-start'}}
              text="Directions"
            />
          </View>
          {yourGym && yourGym.place_id === gym.place_id ? (
            <View
              style={{justifyContent: 'space-between', flexDirection: 'row'}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  alignSelf: 'center',
                }}>
                Your active gym
              </Text>
              <TouchableOpacity
                onPress={() => onOpenGymChat(place_id)}
                style={{justifyContent: 'center', marginRight: 20}}>
                <Icon
                  size={40}
                  name="md-chatboxes"
                />
              </TouchableOpacity>
              <Button
                onPress={() => {
                  Alert.alert('Leave', 'Are you sure?', [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Yes',
                      onPress: () => removeGym(),
                      style: 'destructive',
                    },
                  ]);
                }}
                text="Leave"
                status="danger"
                style={{alignSelf: 'center', marginBottom: 5}}
              >Leave</Button>
            </View>
          ) : (
            <Button
              onPress={() => {
                if (yourGym) {
                  Alert.alert('Join', 'This will leave your current Gym?', [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Yes', onPress: () => join(gym)},
                  ]);
                } else {
                  join(gym);
                }
              }}
              style={{
                paddingHorizontal: 15,
                alignSelf: 'center',
                marginBottom: 10,
              }}
            >Join</Button>
          )}
          {photo && (
            <Image
              style={{
                height: 200,
                width: '90%',
                alignSelf: 'center',
                marginVertical: 10,
              }}
              resizeMode="contain"
              source={{uri: photo}}
            />
          )}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              text="Create Session"
              textStyle={{fontSize: 13}}
              onPress={() => onContinue(null, gym)}
              style={{
                flex: 1,
                marginRight: 10,
                alignItems: 'center',
                paddingVertical: 15,
              }}
            />
            <Button
              onPress={() => {
                close();
                openFriends();
              }}
              textStyle={{fontSize: 13}}
              text="Create Private Session"
              style={{flex: 1, alignItems: 'center', paddingVertical: 15}}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const mapStateToProps = ({profile}: MyRootState) => ({
  location: profile.location,
  yourGym: profile.gym,
});

export default connect(mapStateToProps)(GymModal);
