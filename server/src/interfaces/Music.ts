/* eslint-disable camelcase */
interface IMusic {
  duration: number;
  size: number;
  bit_rate: number;
  title: string;
  album: string;
  file: string;
  artist: string;
  id: number;
}

export default class Music implements IMusic {
  duration: number;

  size: number;

  bit_rate: number;

  title: string;

  album: string;

  file: string;

  artist: string;

  id: number;

  constructor({
    id, duration, size, bit_rate, title, album, artist, file,
  }: IMusic) {
    this.id = id;
    this.duration = Number(duration);
    this.size = Number(size);
    this.bit_rate = Number(bit_rate);
    this.title = title;
    this.album = album;
    this.artist = artist;
    this.file = file;
  }
}
