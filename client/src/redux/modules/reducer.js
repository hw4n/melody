import { combineReducers } from 'redux';
import socketReducer from './socket';
import appReducer from './app';

export default combineReducers({
  socket: socketReducer,
  app: appReducer
});
