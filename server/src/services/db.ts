import dbMusic, { IStoredMusic } from '../models/Music';

// eslint-disable-next-line max-len
export async function sameMusicHasLyrics(music: IStoredMusic): Promise<[boolean, { synced?: boolean | null, lyrics?: string | null}]> {
  const { duration, title, album } = music;
  const foundMusic = await dbMusic.findOne({
    duration,
    title,
    album,
    lyrics: { $ne: '' || null },
  });

  // nothing found
  if (foundMusic === null) {
    return [false, {}];
  }

  const { synced, lyrics } = foundMusic;
  return [foundMusic.lyrics.length > 0, { synced, lyrics }];
}

export function similarMusicHasLyrics() {

}
