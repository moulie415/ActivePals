import {ThunkAction, ThunkDispatch} from 'redux-thunk';
import {Action} from 'redux';
import {ProfileState} from '../reducers/profile';

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
};
type MyExtraArg = undefined;

export type MyThunkResult<R> = ThunkAction<R, MyRootState, MyExtraArg, Action>;

export type MyThunkDispatch = ThunkDispatch<MyRootState, MyExtraArg, Action>;
