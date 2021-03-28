import { IMusic } from '../models/Music';

export function minimizeMusicObject(music: IMusic) {
  const {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
  } = music;
  return {
    duration,
    title,
    album,
    artist,
    id,
    romaji,
  };
}

export function minimizeMusicArray(musicArray: Array<IMusic>) {
  return musicArray.map((music) => minimizeMusicObject(music));
}
