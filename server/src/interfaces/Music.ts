/* eslint-disable camelcase */
interface IMusic {
  duration: string;
  bit_rate: string;
  title: string;
  album: string;
  file: string;
  artist: string;
  id: number;
}

export default class Music implements IMusic {
  duration: string;

  bit_rate: string;

  title: string;

  album: string;

  file: string;

  artist: string;

  id: number;

  constructor({
    id, duration, bit_rate, title, album, artist, file,
  }: IMusic) {
    this.id = id;
    this.duration = duration;
    this.bit_rate = bit_rate;
    this.title = title;
    this.album = album;
    this.artist = artist;
    this.file = file;
  }
}
