import firebase from 'react-native-firebase';
import str from '../constants/strings';

export const createChannels = () => {
  const channelData = [
    {
      id: 'REQUEST',
      name: 'Pal requests',
      description: 'Channel for pal requests',
    },
    {
      id: 'DIRECT_MESSAGES',
      name: 'Direct messages',
      description: 'Channel for direct messages from pals',
    },
    {
      id: 'SESSION_MESSAGES',
      name: 'Session messages',
      description: 'Channel for session messages',
    },
    {
      id: 'GYM_MESSAGES',
      name: 'Gym messages',
      description: 'Channel for gym messages',
    },
    {
      id: 'COMMENT',
      name: 'Comment',
      description: 'Channel for comments on posts',
    },
    {
      id: 'REP',
      name: 'Rep',
      description: 'Channel for reps',
    },
    {
      id: 'ADDED_TO_SESSION',
      name: 'Added to session',
      description: 'Channel for when you get added to a session',
    },
  ];

  const channels = channelData.map(channel => {
    return new firebase.notifications.Android.Channel(
      channel.id,
      channel.name,
      firebase.notifications.Android.Importance.Max
    )
      .setDescription(channel.description)
      .setSound(str.notifSound);
  });

  channels.forEach(channel => {
    firebase.notifications().android.createChannel(channel);
  });
};
