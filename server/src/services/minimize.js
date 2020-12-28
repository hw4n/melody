function minimizeMusicObject(music) {
  const { duration, title, album, artist, id } = music
  return {
    duration,
    title,
    album,
    artist,
    id
  }
}

function minimizeMusicArray(musicArray) {
  return musicArray.map(music => minimizeMusicObject(music));
}
