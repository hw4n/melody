import getCoverArt from './cover';
import Global from '../interfaces/Global';
import { IMusic } from '../models/Music';

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

function pushCurrentMusicAndPlay(music: IMusic) {
  global.MUSICS.push(music);
  // eslint-disable-next-line no-use-before-define
  playMusic();
}

function setNextMusicTimeout(music: IMusic, ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(pushCurrentMusicAndPlay, ms, music);
}

export async function playMusic() {
  const { music, FROM_QUEUE } = fetchMusic();

  const timeoutMS = (music.duration + 6) * 1000;
  global.NEXT_TIMEOUT = setNextMusicTimeout(music, timeoutMS);
  global.PLAYING_START = Number(new Date()) + 3000;

  await getCoverArt(music.filepath).then(() => {
    global.PLAYING = music;
    global.SOCKET.emit('playNext', {
      FROM_QUEUE,
      id: music.id,
      start: global.PLAYING_START,
    });
    return Promise.resolve();
  });
}
