import React from 'react';
import {Linking, Alert, View} from 'react-native';
import {pipe} from 'ramda';
import admob from '@react-native-firebase/admob';
import crashlytics from '@react-native-firebase/crashlytics';
import moment, {Moment} from 'moment';
import Image from 'react-native-fast-image';
import RNCalendarEvents from 'react-native-calendar-events';
import Instabug from 'instabug-reactnative';
import str from './strings';
import Session, {SessionType} from '../types/Session';
import Profile, {UserState} from '../types/Profile';
import Comment from '../types/Comment';
import Post from '../types/Post';
import Message from '../types/Message';
import Notification from '../types/Notification';
import Chat from '../types/Chat';
import {Source} from 'react-native-fast-image';
import ThemedImage from '../components/ThemedImage/ThemedImage';

const formats = ['DD/MM/YYYY', 'MM/DD/YYYY'];

export const showAdmobInterstitial = () => {

  const advert = admob().interstitial(str.admobInterstitial);
 
  const {AdRequest} = admob;
  const request = new AdRequest();
  advert.loadAd(request.build());
  advert.on('onAdLoaded', () => {
    advert.show();
  });
  advert.on('onAdFailedToLoad', (e) => {
    Instabug.logError(e.message);
    crashlytics().recordError(0, e.message);
  });
};
const s4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

export const guid = () => {
  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

export const types = [
  SessionType.CUSTOM,
  SessionType.GYM,
  SessionType.RUNNING,
  SessionType.CYCLING,
  SessionType.SWIMMING,
];

export const getResource = (type: SessionType): Source => {
  if (type === SessionType.CYCLING) {
    return require('../../assets/images/bicycle.png');
  }
  if (type === SessionType.GYM) {
    return require('../../assets/images/dumbbell.png');
  }
  if (type === SessionType.RUNNING) {
    return require('../../assets/images/running.png');
  }
  if (type === SessionType.SWIMMING) {
    return require('../../assets/images/swim.png');
  }
  return require('../../assets/images/custom.png');
};

export const renderImages = () => {
  return (
    <View style={{flexDirection: 'row'}}>
      {types.map((type) => {
        return (
          <ThemedImage
            style={{marginRight: 10}}
            key={guid()}
            size={50}
            source={getResource(type)}
          />
        );
      })}
    </View>
  );
};

export function getType(type: SessionType, size: number, tintColor?: string) {
  switch (type) {
    case SessionType.CYCLING:
      return (
        <ThemedImage
          fill={tintColor}
          size={size}
          source={require('../../assets/images/bicycle.png')}
        />
      );
    case SessionType.GYM:
      return (
        <ThemedImage
          fill={tintColor}
          size={size}
          source={require('../../assets/images/dumbbell.png')}
        />
      );
    case SessionType.RUNNING:
      return (
        <ThemedImage
          fill={tintColor}
          size={size}
          source={require('../../assets/images/running.png')}
        />
      );
    case SessionType.SWIMMING:
      return (
        <ThemedImage
          fill={tintColor}
          size={size}
          source={require('../../assets/images/swim.png')}
        />
      );
    default:
      return (
        <ThemedImage
          fill={tintColor}
          size={size}
          source={require('../../assets/images/custom.png')}
        />
      );
  }
}

export const getMentionsList = (status, friends) => {
  if (status) {
    const split = status.split(' ');
    const last = split[split.length - 1];
    const reduced = last.substring(1);
    if (status && last && str.mentionRegex.test(last)) {
      const filtered = friends.filter((friend) => {
        return (
          friend.username &&
          friend.username.toLowerCase().includes(reduced.toLowerCase())
        );
      });
      if (filtered.length > 0) {
        return filtered;
      }
    } else if (last === '@') {
      return friends;
    }
  }
};

export function calculateAge(birthday) {
  // birthday is a date
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function likesExtractor(item, uid, viewProfile, goToProfile) {
  if (item.likes) {
    return item.likes.map((like) => {
      return {
        image: like.image,
        name: like.username,
        user_id: like.user_id,
        like_id: like.user_id,
        tap: (username) => {
          uid === like.user_id ? goToProfile() : viewProfile(like.user_id);
        },
      };
    });
  }
  return null;
}

export const nth = (d: number) => {
  if (d > 3 && d < 21) {
    return 'th';
  }
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const formatDateTime = (dt: string) => {
  const dateTime = dt.replace(/-/g, '/');
  const date = new Date(dateTime);
  let hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours %= 12;
  hours = hours || 12;
  const minutes = mins < 10 ? `0${mins}` : mins;
  const strTime = `${hours}:${minutes}${ampm}`;
  const day = date.getDate();
  return `${str.days[date.getDay()].toString()} ${
    day.toString() + nth(day)
  } ${str.months[date.getMonth()].toString()} ${strTime}`;
};

export const dayDiff = (first, second, round = true) => {
  const start = new Date(first);
  const end = new Date(second);
  const timeDiff = Math.abs(end.getTime() - start.getTime());
  if (round) {
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  return timeDiff / (1000 * 3600 * 24);
};

export const getSimplifiedTime = (createdAt) => {
  const timeStamp = new Date(createdAt);
  let dateString;
  const now = new Date();
  const today0 = new Date();
  const yesterday0 = new Date(today0.setHours(0, 0, 0, 0));
  yesterday0.setDate(today0.getDate() - 1);

  if (timeStamp < yesterday0) {
    dateString = timeStamp.toDateString();
  } else if (timeStamp < today0) {
    dateString = 'Yesterday';
  } else {
    const minsBeforeNow = Math.floor(
      (now.getTime() - timeStamp.getTime()) / (1000 * 60),
    );
    const hoursBeforeNow = Math.floor(minsBeforeNow / 60);
    if (hoursBeforeNow > 0) {
      dateString = `${hoursBeforeNow} ${
        hoursBeforeNow === 1 ? 'hour' : 'hours'
      } ago`;
    } else if (minsBeforeNow > 0) {
      dateString = `${minsBeforeNow} ${
        minsBeforeNow === 1 ? 'min' : 'mins'
      } ago`;
    } else {
      dateString = 'Just Now';
    }
  }
  return dateString;
};

export const getStateColor = (state: UserState) => {
  switch (state) {
    case UserState.ONLINE:
      return 'green';
    case UserState.AWAY:
      return '#F9BD49';
    default:
      return 'red';
  }
};

const getStateVal = (state: UserState) => {
  switch (state) {
    case UserState.ONLINE:
      return 3;
    case UserState.AWAY:
      return 2;
    default:
      return 1;
  }
};

export const sortByState = (friends: Profile[]) => {
  return friends.sort((a, b) => {
    const stateA = getStateVal(a.state);
    const stateB = getStateVal(b.state);
    return stateB - stateA;
  });
};

export const getDirections = (
  gym,
  yourLocation,
  selectedLocation,
  selectedSession,
) => {
  if (yourLocation) {
    let lat2;
    let lng2;
    const lat1 = yourLocation.latitude;
    const lng1 = yourLocation.longitude;
    if (gym) {
      lat2 = selectedLocation.geometry.location.lat;
      lng2 = selectedLocation.geometry.location.lng;
    } else {
      lat2 = selectedSession.location.position.lat;
      lng2 = selectedSession.location.position.lng;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${lat1},${lng1}&destination=${lat2},${lng2}`;
    Linking.openURL(url).catch((err) =>
      console.error('An error occurred', err),
    );
  } else {
    Alert.alert(
      'No location found',
      'You may need to change your settings to allow Fit Link to access your location',
    );
  }
};

export function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const getDistance = (item, lat1, lon1, gym = false): number => {
  const DEFAULT_DISTANCE = 999999;
  if (lat1 && lon1) {
    let lat2;
    let lon2;
    if (gym) {
      if (item.geometry) {
        lat2 = item.geometry.location.lat;
        lon2 = item.geometry.location.lng;
      } else {
        return DEFAULT_DISTANCE;
      }
    } else {
      lat2 = item.location.position.lat;
      lon2 = item.location.position.lng;
    }
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  return DEFAULT_DISTANCE;
};

export const addSessionToCalendar = (calendarId: string, session: Session) => {
  const date = new Date(session.dateTime.replace(/-/g, '/'));
  const startDate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
  const endDate = new Date(startDate);
  const duration = session.duration + session.durationMinutes / 60;
  endDate.setHours(endDate.getHours() + duration);
  return RNCalendarEvents.saveEvent(session.title, {
    calendarId,
    startDate: new Date(startDate).toISOString(),
    endDate: endDate.toISOString(),
    location: session.location.formattedAddress,
    notes: session.details,
    description: session.details,
  });
};

export const getBirthdayDate = (birthday: string): Moment => {
  if (!birthday) {
    return null;
  }
  for (let i = 0; i < formats.length; i++) {
    if (moment(birthday, formats[i]).isValid()) {
      return moment(birthday, formats[i]);
    }
  }
  return moment(birthday);
};

export const calculateDuration = (data) => {
  const minutes = data.durationMinutes / 60 || 0;
  const hours = data.duration;
  return (minutes + hours) * 60 * 60 * 1000;
};

export const durationString = (session: Session) => {
  const minutes = session.durationMinutes;
  const hours = session.duration;
  let string = ` for ${hours}`;
  hours > 1 ? (string += ' hrs ') : (string += ' hr ');
  if (minutes) {
    string += minutes;
    minutes > 1 ? (string += ' mins') : ' min';
  }
  return string;
};

export const dedupeComments = (comments: Comment[]) => {
  return comments.filter(
    (elem, index, self) =>
      self.findIndex((t) => {
        return t.created_at === elem.created_at && t.key === elem.key;
      }) === index,
  );
};

export const sortComments = (comments: Comment[]) => {
  return comments.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const addCommentIds = (comments: Comment[]) => {
  return comments.map((comment, index) => {
    return {...comment, comment_id: index + 1};
  });
};

export const getNameString = (friend) => {
  let string = '';
  if (friend.username) {
    string += friend.username;
    if (friend.first_name) {
      string += ` (${friend.first_name}`;
      if (friend.last_name) {
        string += ` ${friend.last_name})`;
      } else {
        string += ')';
      }
    }
  } else {
    string += 'No username set ';
    if (friend.name) {
      string += `(${friend.name})`;
    }
  }
  return string;
};

export const getFormattedBirthday = (date) => {
  if (date) {
    const d = new Date(date);
    return `${str.months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
  }
  return null;
};

export const validatePostcode = (code) => {
  const postcode = code.replace(/\s/g, '');
  const regex = /^[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}$/i;
  return regex.test(postcode);
};

export const sortChatsByDate = (array: Chat[]): Chat[] => {
  return array.sort((a, b) => {
    return (
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime()
    );
  });
};

export const sortPostsByDate = (array: Post[]) => {
  return array.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const sortMessagesByCreatedAt = (messages: Message[]) => {
  return messages.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const sortSessionsByDateTime = (sessions: Session[]) => {
  return sessions.sort((a, b) => {
    return moment(a.dateTime).unix() - moment(b.dateTime).unix();
  });
};

export const sortSessionsByDistance = (sessions: Session[]) => {
  return sessions.sort((a, b) => {
    if (a.distance && b.distance) {
      const aDistance = a.distance;
      const bDistance = b.distance;
      return aDistance - bDistance;
    }
    return -100;
  });
};

export const sortNotificationsByDate = (array: Notification[]) => {
  return array.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const pickerItems = (array) => {
  return array.map((item) => {
    return {label: item, value: item};
  });
};

export const dedupeSortAndAddCommentIds = pipe(
  dedupeComments,
  sortComments,
  addCommentIds,
);
export const sortAndAddCommentIds = pipe(sortComments, addCommentIds);
