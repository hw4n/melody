import { Socket } from 'socket.io';
import { IMusic } from '../models/Music';

interface Global {
  PLAYING: IMusic,
  QUEUE: IMusic[],
  MUSICS: IMusic[],
  SOCKET: Socket,
  SOCKETS: string[],
  PLAYING_START: number,
  NEXT_TIMEOUT: ReturnType<typeof setTimeout>,
}

export default Global;
