export function minimizeMusicObject(music) {
  const {
    duration,
    title,
    album,
    artist,
    id,
    titleRomaji,
    artistRomaji,
  } = music;
  return {
    duration,
    title,
    album,
    artist,
    id,
    titleRomaji,
    artistRomaji,
  };
}

export function minimizeMusicArray(musicArray) {
  return musicArray.map((music) => minimizeMusicObject(music));
}
