import { Socket } from 'socket.io';

import { logCyan, logWhite } from '../loaders/logger';
import { minimizeMusicObject, minimizeMusicArray } from './minimize';
import Global from '../interfaces/Global';

declare let global: Global;

function emitTotalUsers() {
  global.SOCKET.emit('total_users', global.SOCKETS.length);
}

export function emitInit(socket: Socket) {
  socket.emit('init', {
    priority: minimizeMusicArray(global.QUEUE),
    queue: minimizeMusicArray(global.MUSICS),
    playing: minimizeMusicObject(global.PLAYING),
    start: global.PLAYING_START,
    total_users: global.SOCKETS.length,
  });
}

export function addSocketListeners(io: Socket = global.SOCKET) {
  // To prevent adding listeners more than once
  io.removeAllListeners('connection');
  io.on('connection', (socket: Socket) => {
    global.SOCKETS.push(socket.id);
    logCyan(`${socket.id} connected, ${socket.handshake.headers['user-agent']}`);
    emitInit(socket);
    emitTotalUsers();
    socket.on('priority', (musicId) => {
      for (let i = 0; i < global.MUSICS.length; i += 1) {
        const song = global.MUSICS[i];
        if (song.id === musicId) {
          global.QUEUE.push(global.MUSICS.splice(i, 1)[0]);
          io.emit('priority', song.id);
          break;
        }
      }
    });
    socket.on('disconnect', (reason) => {
      logCyan(`${socket.id}: ${reason}`);
      for (let i = 0; i < global.SOCKETS.length; i += 1) {
        if (global.SOCKETS[i] === socket.id) {
          global.SOCKETS.splice(i, 1);
          logCyan(`Removed ${socket.id}, ${socket.handshake.headers['user-agent']}`);
          break;
        }
      }
      emitTotalUsers();
    });
  });
  logWhite('Added socket listeners');
}

export function broadcastLyricChange(newLyric: { lyrics: boolean, synced: boolean }) {
  global.SOCKET.emit('renew_lyric', newLyric);
}

export function initializeSocket() {
  addSocketListeners();
  emitInit(global.SOCKET);
}
