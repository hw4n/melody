import { logCyan, logWhite } from '../loaders/logger';
import { minimizeMusicObject, minimizeMusicArray } from './minimize';

function emitTotalUsers() {
  global.SOCKET.emit('total_users', global.SOCKETS.length);
}

export default function addSocketListeners(io) {
  io.on('connection', (socket) => {
    global.SOCKETS.push(socket.id);
    logCyan(`${socket.id} connected, ${socket.handshake.headers['user-agent']}`);
    socket.emit('init', {
      priority: minimizeMusicArray(global.QUEUE),
      queue: minimizeMusicArray(global.MUSICS),
      playing: minimizeMusicObject(global.PLAYING),
      start: global.PLAYING_START,
      total_users: global.SOCKETS.length,
    });
    emitTotalUsers();
    socket.on('priority', (musicId) => {
      for (let i = 0; i < global.MUSICS.length; i += 1) {
        const song = global.MUSICS[i];
        if (song.id === musicId) {
          global.QUEUE.push(global.MUSICS.splice(i, 1)[0]);
          io.sockets.emit('priority', song.id);
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
