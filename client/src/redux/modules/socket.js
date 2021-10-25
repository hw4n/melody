// write about socket's action / reducer

import { enqueue, playNext } from '../../helper/music';

const SOCKET_CONNECT = "SOCKET/CONNECT";
const SOCKET_INIT = "SOCKET/INIT";
const SOCKET_PRIORITY = "SOCKET/PRIORITY";
const SOCKET_PLAY_NEXT = "SOCKET/PLAY_NEXT";
const SOCKET_TOTAL_USERS = "SOCKET/TOTAL_USERS";
const SOCKET_RENEW_LYRICS = "SOCKET/RENEW_LYRICS";

const INIT_STATE = {
  socketId: "",
  playing: {},
  priority: [],
  queue: [],
  start: 0,
  total_users: 1,
}

export default function reducer(state = INIT_STATE, action) {
  switch (action.type) {
    case SOCKET_CONNECT:
      return {...state, socketId: action.socketId};
    case SOCKET_INIT:
      return Object.assign({}, action.data);
    case SOCKET_PRIORITY:
      // enqueue a music from queue array to priority array.
      // music with id of action.musicId should be enqueued.
      return enqueue(state, action);
    case SOCKET_PLAY_NEXT:
      // push current playing music to queue array,
      // dequeue a music from priority or queue array,
      // set that music as current playing music.
      // action.data: {
      //   FROM_QUEUE: "queue"
      //   id: "616977015d619401b017bae9"​
      //   start: 1635168306577
      // }
      return playNext(state, action);
    case SOCKET_TOTAL_USERS:
      // set total users count
      // action.total_users: Number
      return {...state, total_users: action.total_users};
    case SOCKET_RENEW_LYRICS:
      // if lyric mode is on,
      // set lyric mode off and on
      return state;
    default:
      return state;
  }
}
