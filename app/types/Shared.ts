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