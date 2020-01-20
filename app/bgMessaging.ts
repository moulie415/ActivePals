import { handleNotification } from '../index';

export default async message => {
  // handle your message
  handleNotification(message.data);
  return Promise.resolve();
};
