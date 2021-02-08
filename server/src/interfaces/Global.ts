import { Socket } from 'socket.io';
import Music from './Music';

interface Global {
  PLAYING: Music,
  QUEUE: Music[],
  MUSICS: Music[],
  SOCKET: Socket,
  SOCKETS: string[]
}

export default Global;
