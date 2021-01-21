import getCoverArt from './cover';
import { minimizeMusicArray } from './minimize';
import { logWhite } from '../loaders/logger';

const fs = require('fs');
const Throttle = require('throttle');

export function shuffleGlobalMusic() {
  for (let i = global.MUSICS.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = global.MUSICS[randomIndex];
    global.MUSICS[randomIndex] = global.MUSICS[i];
    global.MUSICS[i] = temp;
  }
}

export function playMusic() {
  if (global.MUSICS.length === 0) {
    global.MUSICS.push(...global.PLAYED);
    global.PLAYED.length = 0;
    shuffleGlobalMusic();
    logWhite(`Reloaded and shuffled ${global.MUSICS.length} musics`);

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
    setTimeout(() => {
      global.PLAYED.push(song);
      playMusic();
    }, 3000);
  });

  toPlayReadable.pipe(throttle);
  global.PLAYING_START = Number(new Date()) + 1000;

  getCoverArt(toPlay).then(() => {
    global.SOCKET.sockets.emit('playNext', {
      FROM_QUEUE,
      id: song.id,
      start: global.PLAYING_START,
    });
  });
}
