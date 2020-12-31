/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/extensions
import Music from '../interfaces/Music';
import playMusic from '../services/music';

const fs = require('fs');
const { resolve: pathResolve } = require('path');
const { promisify } = require('util');
const { ffprobe } = require('@dropb/ffprobe');
const { logWhite } = require('./logger');

const mp3Directory = './mp3';

global.PLAYING = {};
global.MUSICS = [];
global.QUEUE = [];
global.PLAYED = [];
global.WRITABLES = {};
global.SOCKETS = [];

async function loadMusicFiles(filePathArray) {
  return new Promise((resolve) => {
    logWhite(`${filePathArray.length} musics found, started loading`);
    filePathArray.forEach((filePath, index) => {
      ffprobe(filePath)
        .then((data) => {
          const id = index;

          let { duration } = data.format;
          // eslint-disable-next-line camelcase
          const { bit_rate } = data.format;
          const m = Math.floor(duration / 60);
          const s = Math.floor(duration - m * 60);
          duration = `${m}:${s.toString().padStart(2, 0)}`;
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
            id, duration, bit_rate, title, album, artist, file: filePath,
          }));

          if (index === filePathArray.length - 1) {
            resolve();
          }
        });
    });
  });
}

function startPlaying() {
  playMusic();
  logWhite('Streaming started');
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = pathResolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []).filter((f) => f.endsWith('.mp3'));
}

exports.initMusic = () => {
  getFiles(mp3Directory).then(loadMusicFiles).then(startPlaying);
};
