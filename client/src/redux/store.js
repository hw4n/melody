import { createStore } from 'redux';
import rootReducer from './modules/reducer';
import io from 'socket.io-client';

const store = createStore(rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

let SOCKET_URI = "/"
if (process.env.NODE_ENV === "development") {
  SOCKET_URI = "http://localhost:3333";
}
const socket = io.connect(SOCKET_URI);

socket.on('init', (data) => {
  store.dispatch({type: "SOCKET/CONNECT", socketId: socket.id});
  store.dispatch({type: "SOCKET/INIT", data});
});

socket.on('priority', (musicId) => {
  store.dispatch({type: "SOCKET/PRIORITY", musicId});
});

socket.on('playNext', (data) => {
  store.dispatch({type: "SOCKET/PLAY_NEXT", data});
});

socket.on('total_users', (total_users) => {
  store.dispatch({type: "SOCKET/TOTAL_USERS", total_users});
});

socket.on('renew_lyric', () => {
  store.dispatch({type: "SOCKET/RENEW_LYRICS"});
});

export default store;
