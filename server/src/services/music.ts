import getCoverArt from './cover';
import Global from '../interfaces/Global';
import { IStoredMusic } from '../models/Music';

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

function pushCurrentMusicAndPlay(music: IStoredMusic) {
  global.MUSICS.push(music);
  // eslint-disable-next-line no-use-before-define
  playMusic();
}

function setNextMusicTimeout(music: IStoredMusic, ms: number): ReturnType<typeof setTimeout> {
  return setTimeout(pushCurrentMusicAndPlay, ms, music);
}

export async function playMusic() {
  const { music, FROM_QUEUE } = fetchMusic();

  // give 3 seconds of padding to the playback
  const timeoutMS = (music.duration + 6) * 1000;
  global.NEXT_TIMEOUT = setNextMusicTimeout(music, timeoutMS);
  global.PLAYING_START = Number(new Date()) + 3000;

  // get cover art image from music
  await getCoverArt(music.filepath);

  // set music info
  global.PLAYING = music;

  // broadcast to play next music
  global.SOCKET.emit('playNext', {
    FROM_QUEUE,
    id: music.id,
    start: global.PLAYING_START,
  });
}

// find index of global music array by music id
export function findMusicIndexById(musicId: string): number {
  return global.MUSICS.findIndex((music) => music.id === musicId);
}

// find and extract music from global music array by music id
export function extractMusicById(musicId: string) {
  const index = findMusicIndexById(musicId);

  if (index === -1) return null;

  return global.MUSICS.splice(index, 1)[0];
}

// enqueue music from global music array by music id
export function enqueueMusicById(musicId: string) {
  const music = extractMusicById(musicId);

  if (music === null) return;

  global.QUEUE.push(music);
}
