import { IStoredMusic } from '../models/Music';

export function minimizeMusicObject(music: IStoredMusic) {
  const {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
    lyrics,
    synced,
  } = music;
  return {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
    lyrics: Boolean(lyrics),
    synced,
  };
}

export function minimizeMusicArray(musicArray: Array<IStoredMusic>) {
  return musicArray.map((music) => minimizeMusicObject(music));
}
