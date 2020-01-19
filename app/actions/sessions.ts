import firebase from 'react-native-firebase';
import { Alert } from 'react-native';
import { geofire } from '../../index';
import { fetchUsers, updateUsers } from './home';
import { setGym } from './profile';
import { calculateDuration } from '../constants/utils';

export const SET_SESSIONS = 'SET_SESSIONS';
export const UPDATE_SESSIONS = 'UPDATE_SESSIONS';
export const UPDATE_PRIVATE_SESSIONS = 'UPDATE_PRIVATE_SESSIONS';
export const SET_PRIVATE_SESSIONS = 'SET_PRIVATE_SESSIONS';
export const SET_PRIVATE_SESSION = 'SET_PRIVATE_SESSION';
export const SET_SESSION = 'SET_SESSION';
export const SET_PLACES = 'SET_PLACES';
export const SET_PLACE = 'SET_PLACE';
export const SET_RADIUS = 'SET_RADIUS';
export const SET_IGNORED = 'SET_IGNORED';

const setPrivateSessions = sessions => ({
  type: SET_PRIVATE_SESSIONS,
  sessions,
});

const updateSessions = sessions => ({
  type: UPDATE_SESSIONS,
  sessions,
});

const updatePrivateSessions = sessions => ({
  type: UPDATE_PRIVATE_SESSIONS,
  sessions,
});

const setSession = session => ({
  type: SET_SESSION,
  session,
});

const setPrivateSession = (session) => ({
  type: SET_PRIVATE_SESSION,
  session,
});

export const setPlaces = (places) => ({
  type: SET_PLACES,
  places,
});

export const setPlace = (place) => ({
  type: SET_PLACE,
  place,
});

export const setRadius = (radius) => ({
  type: SET_RADIUS,
  radius,
});

export const setIgnored = (session) => ({
  type: SET_IGNORED,
  session,
});

const checkHost = (host, state) => {
  const { uid } = state.profile.profile;
  if (host === uid) return true;
  if (state.friends.friends[host]) return true;
  if (state.sharedInfo.users[host]) return true;
};

const expirationAlert = (session, isPrivate) => {
  return (dispatch, getState) => {
    const ignore = getState().sessions.ignored[session.key];
    if (!ignore) {
      const { uid } = getState().profile.profile;
      const action = session.val().host === uid ? 'delete' : 'leave';
      Alert.alert(
        `${session.val().title} has expired`,
        `Do you want to ${action} the session?`,
        [
          {text: "Don't ask me again", onPress: () => dispatch(setIgnored(session.key)) },
          {text: 'Yes', onPress: () => dispatch(removeSession(session.key, isPrivate)), style: 'destructive'},
          {text: 'Cancel', style: 'cancel'}
        ]
      )
    }
  };
};

export const fetchSessions = () => {
  return async (dispatch, getState) => {
    dispatch(updateSessions([]));
    const { radius } = getState().sessions;
    const { uid } = getState().profile.profile;
    const userFetches = [];
    firebase
      .database()
      .ref('userSessions')
      .child(uid)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const promises = [];
          Object.keys(snapshot.val()).forEach(key => {
            if (snapshot.val()[key] !== 'private') {
              promises.push(firebase.database().ref('sessions').child(key).once('value'))
            }
          });
          Promise.all(promises).then(sessions => {
            const obj = {}
            sessions.forEach(session => {
              const { host } = session.val();
              if (!checkHost(host, getState())) {
                userFetches.push(host);
              }
              const duration = calculateDuration(session.val());
              const time = new Date(session.val().dateTime.replace(/-/g, '/')).getTime();
              const current = new Date().getTime()
              if (time + duration < current) {
                dispatch(expirationAlert(session, false));
              }
              obj[session.key] = { ...session.val(), host, key: session.key }
            })
            dispatch(updateSessions(obj))
            dispatch(fetchUsers(userFetches))
          });
        } else {
          dispatch(removeSession(snapshot.key, false))
        }
      });

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const geoQuery = geofire.query({
            center: [lat, lon],
            radius,
          });

          const onReadyRegistration = geoQuery.on("ready",() => {
            console.log("GeoQuery has loaded and fired all other events for initial data")
            resolve()
          })

          const onKeyEnteredRegistration = geoQuery.on("key_entered", (key, location, distance) => {
            console.log(key + " entered query at " + location + " (" + distance + " km from center)")
            firebase.database().ref('sessions/' + key).once('value', snapshot => {
              if (snapshot.val()) {
                const duration = calculateDuration(snapshot.val());
                const time = new Date(snapshot.val().dateTime.replace(/-/g, '/')).getTime()
                const current = new Date().getTime();
                if (time + duration > current) {
                  const inProgress = time < current;
                  firebase.database().ref('users/' + snapshot.val().host).once('value', host => {
                    dispatch(setSession({...snapshot.val(), key, inProgress, distance, host: host.val()}))
                  })
                }
              }
            })
          })

          const onKeyExitedRegistration = geoQuery.on("key_exited", (key, location, distance) => {
            console.log(key + " exited query to " + location + " (" + distance + " km from center)")
            dispatch(removeSession(key, false, true));
          })

          const onKeyMovedRegistration = geoQuery.on("key_moved", (key, location, distance) => {
            console.log(key + " moved within query to " + location + " (" + distance + " km from center)")
          })

        },
        (error) => {

        },
      { enableHighAccuracy: true, timeout: 20000 /*, maximumAge: 1000*/ },
      )
      })
        
    }
	}


export const fetchPrivateSessions = () => {
  return async (dispatch, getState) => {
    const { uid } = getState().profile.profile;
    const userFetches = [];
    return firebase.database().ref('userSessions').child(uid).on('value', snapshot => {
      if (snapshot.val()) {
          const promises = [];
          Object.keys(snapshot.val()).forEach(key => {
          if (snapshot.val()[key] === 'private') {
            promises.push(firebase.database().ref('privateSessions').child(key).once('value'))
          }
        })
        return Promise.all(promises).then(sessions => {
          const privateSessions = sessions.map(session => {
            const duration = calculateDuration(session.val())
            const time = new Date(session.val().dateTime.replace(/-/g, "/")).getTime()
            const current = new Date().getTime()
            if (time + duration < current) {
              dispatch(expirationAlert(session, true))
            }
            const inProgress = (time + duration > current && time < current);
            const host = session.val().host
            
            if (!checkHost(host, getState())) {
              userFetches.push(host);
            }
            return {...session.val(), key: session.key, inProgress, host}
          })

          const obj = privateSessions.reduce((acc, cur, i) => {
            if (cur) {
              acc[cur.key] = cur
            }
            return acc
          }, {})
          dispatch(setPrivateSessions(obj))
          dispatch(fetchUsers(userFetches))
        })
      }
      else {
        dispatch(removeSession(snapshot.key, true))
      }
    })
  }
}

export const fetchSession = (id) => {
  return async (dispatch, getState) => {
    let distance;
    //check if session exists and use existing distance value
    const currentSession = getState().sessions.sessions[id];
    if (currentSession) {
      distance = currentSession.distance
    }

    const session = await firebase.database().ref('sessions').child(id).once('value')
    if (session.val().gym) {
      dispatch(fetchGym(session.val().gym.place_id));
    }
    if (session.val().users) {
      const	unfetched = Object.keys(session.val().users).filter(user => {
        return !(getState().friends.friends[user] && getState().sharedInfo.users[user])
      })
      dispatch(fetchUsers(unfetched))
    }
    const duration = calculateDuration(session.val());
    const time = new Date(session.val().dateTime.replace(/-/g, '/')).getTime();
    const current = new Date().getTime();
    const inProgress = (time + duration > current && time < current)
    const host = await firebase.database().ref('users/' + session.val().host).once('value')
    dispatch(setSession({ ...session.val(), key: session.key, inProgress, distance, host: host.val() }));
  }
}

export const fetchPrivateSession = (id) => {
  return async (dispatch, getState) => {
    const session = await firebase.database().ref('privateSessions').child(id).once('value')
    if (session.val().gym) {
      dispatch(fetchGym(session.val().gym.place_id))
    }
    if (session.val().users) {
      const unfetched = Object.keys(session.val().users).filter(user => {
        return !(getState().friends.friends[user] && getState().sharedInfo.users[user])
      })
      dispatch(fetchUsers(unfetched));
    }
    const duration = calculateDuration(session.val());
    const time = new Date(session.val().dateTime.replace(/-/g, '/')).getTime();
    const current = new Date().getTime();
    const inProgress = (time + duration > current && time < current)
    const host = await firebase.database().ref('users/' + session.val().host).once('value')
    dispatch(setPrivateSession({ ...session.val(), key: session.key, inProgress, host: host.val() }));
  };
};

export const removeSession = (key, isPrivate, force = false) => {
  return (dispatch, getState) => {
    const { uid } = getState().profile.profile;
    const sessions = isPrivate ? getState().sessions.privateSessions : getState().sessions.sessions;
    const session = sessions[key];
    const type = isPrivate ? 'privateSessions' : 'sessions';
    if (session && session.host.uid === uid) {
      firebase.database().ref(type + '/' + key).remove()
      Object.keys(session.users).forEach(user => firebase.database().ref(`userSessions/${user}`).child(key).remove())
      firebase.database().ref('sessionChats').child(key).remove()
      if (!isPrivate) {
        geofire.remove(key);
      }
    } else {
      firebase.database().ref(`userSessions/${uid}`).child(key).remove()
      firebase.database().ref(type + '/' + key + '/users').child(uid).remove()
    }
    let obj;
    if (session && (isPrivate || session.host.uid === uid || force)) {
      const sessionsArr = Object.values(sessions).filter(session => session.key !== key)
      obj = sessionsArr.reduce((acc, cur, i) => {
        if (cur) {
          acc[cur.key] = cur;
        }
        return acc;
      }, {});
    } else {
      obj = sessions
      if (obj[key] && obj[key].users) {
        obj[key].users[uid] = false;
      }
    }
    isPrivate ? dispatch(updatePrivateSessions(obj)) : dispatch(updateSessions(obj))
  };
};

export const addUser = (key, isPrivate, uid) => {
  return async (dispatch, getState) => {
    const type = isPrivate ? 'privateSessions/' : 'sessions/';
    await firebase.database().ref(`userSessions/${uid}`).child(key).set(isPrivate ? 'private' : true);
    await firebase.database().ref(type + key + '/users').child(uid).set(true);
    const sessions = isPrivate ? getState().sessions.privateSessions : getState().sessions.sessions;
    const session = sessions[key];
    session.users = { ...session.users, [uid]: true };
    isPrivate ? dispatch(setPrivateSession(session)) : dispatch(setSession(session));
  };
};

export const fetchPhotoPath = (result) => {
  return new Promise(resolve => {
    if (result.photos && result.photos[0].photo_reference) {
      const url = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=';
      const fullUrl = `${url}${result.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}`;
      fetch(fullUrl)
        .then(response => {
          resolve({ ...result, photo: response.url });
        })
        .catch(e => {
          console.log(e);
          resolve(result);
        });
    } else resolve(result);
  });
};

export const fetchPhotoPaths = () => {
  return (dispatch, getState) => {
    const obj = getState().sessions.places;
    const paths = Object.values(obj).map(place => fetchPhotoPath(place));
    Promise.all(paths).then(places => {
      places.forEach(place => {
        obj[place.place_id] = place
      })
      dispatch(setPlaces(obj))
    })
  }
}

export const fetchGym = (id) => {
  return (dispatch, getState) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${process.env.GOOGLE_API_KEY}`;
    return fetch(url).then(response => response.json())
      .then(json => fetchPhotoPath(json.result))
      .then(async gym => {
        const users = await firebase.database().ref('gyms/' + id + '/users').once('value')
        if (users && users.val()) {
          gym.users = users.val()
          const	unfetched = Object.keys(users.val()).filter(user => {
            return !(getState().friends.friends[user] && getState().sharedInfo.users[user])
          })
          dispatch(fetchUsers(unfetched))
        }

        dispatch(setPlace(gym))
        const yourGym = getState().profile.gym
        if (yourGym && yourGym.place_id == gym.place_id) {
          dispatch(setGym(gym))
        }
      })
  }
}

const mapIdsToPlaces = places => {
  const obj = {};
  places.forEach(place => {
    obj[place.place_id] = place;
  });
  return obj;
};

export const fetchPlaces = (lat, lon, token) => {
  return dispatch => {
    return new Promise(resolve => {
      const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
      const fullUrl = `${url}location=${lat},${lon}&rankby=distance&types=gym&key=${process.env.GOOGLE_API_KEY}`;
      if (token) {
        fetch(`${fullUrl}&pagetoken=${token}`)
        .then(response => response.json())
        .then(json => {
          if (json.error_message) {
            throw json.error_message;
          }
          else {
            dispatch(setPlaces(mapIdsToPlaces(json.results)))
            dispatch(fetchPhotoPaths())
            resolve({token: json.next_page_token})
          }
        })
      }
      else {
        fetch(fullUrl).then(response => response.json())
        .then(json => {
          if (json.error_message) {
            throw json.error_message;
          }
          else {
            dispatch(setPlaces(mapIdsToPlaces(json.results)))
            dispatch(fetchPhotoPaths())
            resolve({token: json.next_page_token})
          }
        })
      }
    })
  }
}


