import Music from '../interfaces/Music';
import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import addSocketListeners from '../services/socket';
import { logWhite } from './logger';

const fs = require('fs');
const { resolve: pathResolve } = require('path');
const { promisify } = require('util');
const { ffprobe } = require('@dropb/ffprobe');

const mp3Directory = './mp3';

declare let global: Global;
global.QUEUE = [];
global.MUSICS = [];
global.PLAYED = [];
global.SOCKETS = [];
global.WRITABLES = {};

async function loadMusicFiles(filePathArray) {
  return new Promise<void>((resolve) => {
    logWhite(`${filePathArray.length} musics found, started loading`);
    filePathArray.forEach((filePath, index) => {
      ffprobe(filePath)
        .then((data) => {
          const id = index;
          // eslint-disable-next-line camelcase
          const { duration, size, bit_rate } = data.format;
          let { title, album, artist } = data.format.tags;
          if (title === undefined) {
            title = filePath.substr(0, filePath.lastIndexOf('.'));
          }

          if (album === undefined) {
            album = '-';
          }
          if (artist === undefined) {
            artist = 'Various Artists';
          }

          global.MUSICS.push(new Music({
            id, duration, size, bit_rate, title, album, artist, file: filePath,
          }));

          if (index === filePathArray.length - 1) {
            resolve();
          }
        });
    });
  });
}

function startPlaying() {
  shuffleGlobalMusic();
  playMusic();
  addSocketListeners(global.SOCKET);
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs: [string] = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = pathResolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []).filter((f) => f.endsWith('.mp3'));
}

exports.initMusic = () => {
  getFiles(mp3Directory).then(loadMusicFiles).then(startPlaying);
};
