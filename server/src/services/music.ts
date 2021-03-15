import getCoverArt from './cover';
import Global from '../interfaces/Global';

declare let global: Global;

export function shuffleGlobalMusic() {
  for (let i = global.MUSICS.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temp = global.MUSICS[randomIndex];
    global.MUSICS[randomIndex] = global.MUSICS[i];
    global.MUSICS[i] = temp;
  }
}

function fetchMusic() {
  if (global.QUEUE.length > 0) {
    return {
      music: global.QUEUE.shift(),
      FROM_QUEUE: 'priority',
    };
  }
  return {
    music: global.MUSICS.shift(),
    FROM_QUEUE: 'queue',
  };
}

export function playMusic() {
  const { music, FROM_QUEUE } = fetchMusic();

  global.NEXT_TIMEOUT = Number(setTimeout(() => {
    global.MUSICS.push(music);
    playMusic();
  }, (music.duration + 3) * 1000));
  global.PLAYING_START = Number(new Date()) + 1500;

  getCoverArt(music.filepath).then(() => {
    global.PLAYING = music;
    global.SOCKET.emit('playNext', {
      FROM_QUEUE,
      id: music.id,
      start: global.PLAYING_START,
    });
  });
}
