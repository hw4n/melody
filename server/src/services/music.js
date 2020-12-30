import getCoverArt from './cover';
import { minimizeMusicArray } from './minimize';
import { logWhite } from '../loaders/logger';

const fs = require('fs');
const Throttle = require('throttle');

export default function playMusic() {
  if (global.MUSICS.length === 0) {
    global.MUSICS.push(...global.PLAYED);
    global.PLAYED.length = 0;
    logWhite(`Reloaded ${global.MUSICS.length} musics`);

    global.SOCKET.sockets.emit('init', {
      priority: minimizeMusicArray(global.QUEUE),
      queue: minimizeMusicArray(global.MUSICS),
      played: minimizeMusicArray(global.PLAYED),
      playing: {},
    });
  }

  let song;
  let FROM_QUEUE;
  if (global.QUEUE.length > 0) {
    song = global.QUEUE.shift();
    FROM_QUEUE = 'priority';
  } else {
    song = global.MUSICS.shift();
    FROM_QUEUE = 'queue';
  }

  const toPlay = song.file;
  global.PLAYING = song;

  const toPlayReadable = fs.createReadStream(toPlay);
  const throttle = new Throttle(song.bit_rate / 8);

  throttle.on('data', (chunk) => {
    Object.values(global.WRITABLES).forEach((writable) => {
      writable.write(chunk);
    });
  }).on('end', () => {
    global.PLAYED.push(song);
    playMusic();
  });

  toPlayReadable.pipe(throttle);

  getCoverArt(toPlay).then(() => {
    setTimeout(() => {
      global.SOCKET.sockets.emit('playNext', {
        FROM_QUEUE,
        id: song.id,
      });
    }, 3000);
  });
}
