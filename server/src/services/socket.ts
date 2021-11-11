import { Server, Socket } from 'socket.io';

import { logCyan, logWhite } from '../loaders/logger';
import { minimizeMusicObject, minimizeMusicArray } from './minimize';
import Global from '../interfaces/Global';
import { enqueueMusicById } from './music';

declare let global: Global;

function emitTotalUsers() {
  global.SOCKET.emit('total_users', global.SOCKETS.length);
}

export function emitInit(socket: Socket | Server) {
  socket.emit('init', {
    priority: minimizeMusicArray(global.QUEUE),
    queue: minimizeMusicArray(global.MUSICS),
    playing: minimizeMusicObject(global.PLAYING),
    start: global.PLAYING_START,
    total_users: global.SOCKETS.length,
  });
}

// find socket by id and remove from array
function removeSocketById(socketId: string) {
  const index = global.SOCKETS.findIndex((socket) => socket === socketId);
  if (index === -1) return;
  global.SOCKETS.splice(index, 1);
}

export function addSocketListeners(io: Server = global.SOCKET) {
  // To prevent adding listeners more than once
  io.removeAllListeners('connection');
  io.on('connection', (socket: Socket) => {
    global.SOCKETS.push(socket.id);
    logCyan(`${socket.id} connected, ${socket.handshake.headers['user-agent']}`);
    emitInit(socket);
    emitTotalUsers();

    socket.on('priority', (musicId: string) => {
      enqueueMusicById(musicId);
      io.emit('priority', musicId);
    });

    socket.on('disconnect', (reason) => {
      logCyan(`${socket.id}: ${reason}`);
      removeSocketById(socket.id);
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
