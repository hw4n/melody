import getCoverArt from './cover';

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

  setTimeout(() => {
    global.MUSICS.push(song);
    playMusic();
  }, (song.duration + 3) * 1000);
  global.PLAYING_START = Number(new Date()) + 1500;

  getCoverArt(toPlay).then(() => {
    global.SOCKET.sockets.emit('playNext', {
      FROM_QUEUE,
      id: song.id,
      start: global.PLAYING_START,
    });
  });
}
