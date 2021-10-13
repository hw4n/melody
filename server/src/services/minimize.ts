import { IMusic } from '../models/Music';

export function minimizeMusicObject(music: IMusic) {
  const {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
    synced,
  } = music;
  return {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
    synced,
  };
}

export function minimizeMusicArray(musicArray: Array<IMusic>) {
  return musicArray.map((music) => minimizeMusicObject(music));
}
