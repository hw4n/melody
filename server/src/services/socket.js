import { logCyan } from '../loaders/logger';
import { minimizeMusicObject, minimizeMusicArray } from './minimize';

exports.addListeners = (io) => {
  io.on('connection', (socket) => {
    global.SOCKETS.push(socket.id);
    logCyan(`${socket.id} connected, ${socket.handshake.headers['user-agent']}`);
    socket.emit('init', {
      priority: minimizeMusicArray(global.QUEUE),
      queue: minimizeMusicArray(global.MUSICS),
      played: minimizeMusicArray(global.PLAYED),
      playing: minimizeMusicObject(global.PLAYING),
    });
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
      if (Object.keys(global.WRITABLES).includes(socket.id)) {
        delete global.WRITABLES[socket.id];
      }
      for (let i = 0; i < global.SOCKETS.length; i += 1) {
        if (global.SOCKETS[i] === socket.id) {
          global.SOCKETS.splice(i, 1);
          logCyan(`Removed ${socket.id}, ${socket.handshake.headers['user-agent']}`);
          break;
        }
      }
    });
  });
};
