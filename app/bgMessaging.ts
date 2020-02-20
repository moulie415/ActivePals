import { handleNotification } from './App';

export default async message => {
  // handle your message
  handleNotification(message.data);
  return Promise.resolve();
};
