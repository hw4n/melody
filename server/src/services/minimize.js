export function minimizeMusicObject(music) {
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

export function minimizeMusicArray(musicArray) {
  return musicArray.map((music) => minimizeMusicObject(music));
}
