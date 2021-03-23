import Global from '../interfaces/Global';
import { logWhite, logYellow } from '../loaders/logger';
import { playMusic } from './music';

const readline = require('readline');
const loader = require('../loaders');

declare let global: Global;

export default function initReadline() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.on('line', (command) => {
    if (command === 'fs') {
      logYellow('fs: force skipping current music');
      clearTimeout(global.NEXT_TIMEOUT);
      global.MUSICS.push(global.PLAYING);
      playMusic();
    }

    if (command === 'reload') {
      logYellow('--- RELOADING MUSICS ---');
      clearTimeout(global.NEXT_TIMEOUT);
      loader.initMusic();
    }
  });
  logWhite('Initialized readline and waiting for command');
}
