import React from 'react'
import Modal from 'react-native-modalbox'
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native'
import { Icon } from 'native-base'
import Text from '../Text'
import Hyperlink from 'react-native-hyperlink'
import colors from '../../constants/colors'
import PrivateIcon from '../PrivateIcon'
import { getDistance, formatDateTime } from '../../constants/utils'
import Button from '../Button'
import styles from './styles'
import firebase from 'react-native-firebase'
import PropTypes from 'prop-types'

const SessionModal = ({
  session,
  disabled,
  profile,
  viewSession,
  viewGym,
  location,
  openChat,
  viewDirections,
  viewProfile,
  join,
  remove,
  close,
  users
}) => {
  return  <Modal style={styles.modal} position={"center"} ref={"modal"} isDisabled={disabled}>
  {session && <View style={{flex: 1}}>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
      <Text style={{fontSize: 20, textAlign: 'center', padding: 10, color: '#000'}}>
      {session.title}</Text>
      <TouchableOpacity
          onPress={()=> viewSession(session.key, session.private)}>
        <Icon name={'md-information-circle'} style={{color: colors.secondary, fontSize: 40, }}/>
      </TouchableOpacity>
    </View>
    <ScrollView style={{margin: 10}}>
    <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
      <View style={{flexDirection: 'row'}}>
        <Text style={{color: '#999'}}>Host: </Text>
        {fetchHost(session.host, profile.uid, viewProfile, users)}
      </View>
      {session.users[profile.uid] && <TouchableOpacity
        onPress={()=> {
          openChat(session)
        }}>
      <Icon name='md-chatboxes' style={{color: colors.secondary, paddingHorizontal: 10}}/>
    </TouchableOpacity>}
    {session.private && <PrivateIcon />}
      </View>
    <Hyperlink
    linkStyle={{color: colors.secondary}}
    linkDefault={ true }>
      <Text style={{marginVertical: 5, color: '#999'}}>Details: <Text style={{color: '#000'}}>{session.details}</Text></Text>
    </Hyperlink>
    <Text style={{marginVertical: 5, color: '#000'}}>{(formatDateTime(session.dateTime))
      + " for " + (session.duration) + " " +
      (session.duration > 1 ? 'hours' : 'hour') }</Text>
      
      <View style={{flexDirection: 'row', marginVertical: 5, alignItems: 'center',justifyContent: 'space-between'}}>
        <Text style={{flex: 1}}>
          <Text style={{color: '#000'}}>{session.location.formattedAddress}</Text>
          <Text style={{color: '#999'}}>{' (' + (session.distance ? session.distance.toFixed(2) :
            getDistance(session, location.lat, location.lon)) + ' km away)'}</Text>
        </Text>
        <Button onPress={()=> {
          const { lat, lng } = session.location.position
          const options = {
            latitude: lat,
            longitude: lng,
            cancelText: 'Cancel',
            sourceLatitude: location.latitude,  
            sourceLongitude: location.longitude,  
            }
            viewDirections(options)
          }}
          style={{marginLeft: 10}}
          text='Directions'
        />

      </View>
      {session.gym && <TouchableOpacity
            onPress={()=> viewGym(session.gym.place_id)}>
        <Text style={{color: '#999', marginVertical: 10}}>Gym: <Text style={{color: colors.secondary, fontWeight: 'bold'}}>{session.gym.name}</Text></Text>
      </TouchableOpacity>}
      </ScrollView>
       {<View style={{justifyContent: 'flex-end', flex: 1, margin: 10}}>
       {fetchButtons(session, profile.uid, join, remove, close)}
       </View>}
      </View>}
  </Modal>
}

const fetchButtons = (session, uid, join, remove, close) => {
  if (session.users[uid]){
    if (session.host.uid == uid) {
      return (
        <Button
        onPress={()=> {
          Alert.alert(
            "Delete session",
            "Are you sure?",
            [
            {text: 'cancel', style: 'cancel'},
            {text: 'Yes', onPress: ()=> {
              remove(session.key, session.private)
              close()
            },
            style: 'destructive'}
            ],
          )
        }}
        style={{alignSelf: 'center'}}
        color='red'
        text="Delete"
        />
        )
    }
    else return (
        <Button
        color='red'
        text="Leave"
        style={{alignSelf: 'center'}}
        onPress={()=> {
          remove(session.key, session.private)
          close()
        }}
        />
      )
  }
  else {
    return (
        <Button
        text="Join"
        style={{alignSelf: 'center'}}
        onPress={()=> {
          firebase.database().ref('users/' + uid + '/sessions').child(session.key).set(true)
          .then(() => {
            join(session.key, session.private)
          })
          firebase.database().ref('sessions/' + session.key + '/users').child(uid).set(true)
          close()
          Alert.alert('Session joined', 'You should now see this session in your session chats')
        }}
        />
      )
  }
}

const fetchHost = (host, uid, viewProfile, users) => {
  if (host.uid == uid) {
    return <Text style={{fontWeight: 'bold'}}>You</Text>
  }
  else if (host.username) {
    return <TouchableOpacity onPress={()=> viewProfile(host.uid)}>
            <Text style={{color: colors.secondary}}>{host.username}</Text>
          </TouchableOpacity>
  }
  else if (users[host.uid]) {
    return <TouchableOpacity onPress={()=> viewProfile(host.uid)}>
            <Text style={{color: colors.secondary}}>{users[host.uid].username}</Text>
          </TouchableOpacity>
  }
  else return <Text>N/A</Text>
}


SessionModal.propTypes = {
  session: PropTypes.any,
  disabled: PropTypes.bool,
  profile: PropTypes.any,
  viewSession: PropTypes.func,
  viewGym: PropTypes.func,
  location: PropTypes.any,
  openChat: PropTypes.func,
  viewDirections: PropTypes.func,
  viewProfile: PropTypes.func,
  join: PropTypes.func,
  remove: PropTypes.func,
  close: PropTypes.func,
  users: PropTypes.any
}

export default SessionModal