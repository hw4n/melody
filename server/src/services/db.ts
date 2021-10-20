import dbMusic, { IMusic } from '../models/Music';

// eslint-disable-next-line max-len
export async function sameMusicHasLyrics(music: IMusic): Promise<[boolean, { synced?: boolean | null, lyrics?: string | null}]> {
  const { duration, title, album } = music;
  return dbMusic.findOne({
    duration,
    title,
    album,
    lyrics: { $ne: '' || null },
  }).then((foundMusic) => {
    if (foundMusic === null || foundMusic.lyrics === undefined) {
      return [false, {}];
    }
    const { synced, lyrics } = foundMusic;
    return [foundMusic.lyrics.length > 0, { synced, lyrics }];
  });
}

export function similarMusicHasLyrics() {

}
