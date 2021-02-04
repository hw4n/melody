import getCoverArt from './cover';

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
      global.MUSICS.push(song);
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
