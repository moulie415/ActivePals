import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {ProfileState} from '../reducers/profile';
import {FriendsState} from '../reducers/friends';
import {HomeState} from '../reducers/home';
import {SharedInfoState} from '../reducers/sharedInfo';
import {ChatsState} from '../reducers/chats';
import {SessionsState} from '../reducers/sessions';
import { MessageType } from './Message';
import { NotificationType } from './Notification';

export enum TaskEvent {
  STATE_CHANGED = 'state_changed',
}

export enum TaskState {
  CANCELLED = 'cancelled',
  ERROR = 'error',
  PAUSED = 'paused',
  RUNNING = 'running',
  SUCCESS = 'success',
}

export type Theme = 'dark' | 'light';

export type MyRootState = {
  profile: ProfileState;
  friends: FriendsState;
  home: HomeState;
  sharedInfo: SharedInfoState;
  chats: ChatsState;
  sessions: SessionsState;
};
type MyExtraArg = undefined;

export type MyThunkResult<R> = ThunkAction<R, MyRootState, MyExtraArg, Action>;

export type MyThunkDispatch = ThunkDispatch<MyRootState, MyExtraArg, Action>;

export interface PushNotificationData {
  type: MessageType | NotificationType;
  sessionId?: string;
  chatId?: string;
  uid: string;
  username: string;
  postId?: string;
  gymId?: string;
  isPrivate?: boolean;
}
