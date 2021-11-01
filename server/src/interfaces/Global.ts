import { Socket } from 'socket.io';
import { IStoredMusic } from '../models/Music';

interface Global {
  PLAYING: IStoredMusic,
  QUEUE: IStoredMusic[],
  MUSICS: IStoredMusic[],
  SOCKET: Socket,
  SOCKETS: string[],
  PLAYING_START: number,
  NEXT_TIMEOUT: ReturnType<typeof setTimeout>,
}

export default Global;
