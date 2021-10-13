import { basename } from 'path';

import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import addSocketListeners from '../services/socket';
import { logRed, logWhite } from './logger';
import dbMusic, { IMusic } from '../models/Music';
import diff from '../services/diff';
import initReadline from '../services/console';

initReadline();

const fs = require('fs');
const { resolve: pathResolve } = require('path');
const { promisify } = require('util');
const { ffprobe } = require('@dropb/ffprobe');

const mp3Directory = './mp3';

declare let global: Global;
global.QUEUE = [];
global.MUSICS = [];
global.SOCKETS = [];

const Kuroshiro = require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const kuroshiro = new Kuroshiro();

const mongoose = require('mongoose');

mongoose.connect(process.env.DBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}, () => {
  logWhite('Connected to DB');
});

async function toRomaji(japanese) {
  const result = await kuroshiro.convert(japanese, { to: 'romaji', romajiSystem: 'passport' });
  return result;
}

async function analyzeMusic(filepath): Promise<IMusic> {
  return new Promise((resolve) => {
    ffprobe(filepath).then((data) => {
      const { duration, size, bit_rate: bitrate } = data.format;
      const {
        title = basename(filepath, 'mp3'),
        album = '-',
        artist = 'Various Artists',
      } = data.format.tags;

      Promise.all([toRomaji(title), toRomaji(artist)])
        .then((romaji) => {
          const music = {
            duration,
            size,
            bitrate,
            title,
            album,
            artist,
            filepath,
            romaji: {
              title: '',
              artist: '',
            },
          } as IMusic;
          [music.romaji.title, music.romaji.artist] = romaji;
          resolve(music);
        });
    });
  });
}

async function analyzeMusics(filepaths: Array<String>) {
  return Promise.all(filepaths.map((filepath) => analyzeMusic(filepath)));
}

async function insertMusics(musics: Array<IMusic>) {
  return new Promise<Array<IMusic>>((resolve) => {
    logWhite(`Inserting ${musics.length} music into DB`);
    dbMusic.insertMany(musics).then(resolve);
  });
}

async function processDbLocalDiff(filePathArray: Array<String>) {
  return new Promise<Array<String>>((resolve) => {
    dbMusic.find({}).then((dbMusics) => {
      logWhite(`${dbMusics.length} / ${filePathArray.length} music found from DB / local files`);

      const dbSet = new Set(dbMusics.map((music) => music.filepath));
      const localSet = new Set(filePathArray);
      const dbOnly = diff(dbSet, localSet);
      const localOnly = diff(localSet, dbSet);

      logWhite(`${dbOnly.length} / ${localOnly.length} music only available in DB / local files`);

      analyzeMusics(localOnly).then(insertMusics).then(() => {
        resolve(dbOnly);
      });
    });
  });
}

async function findEveryMusicAndFilter(pathsToExclude: Array<String>): Promise<Array<IMusic>> {
  return new Promise<Array<IMusic>>((resolve) => {
    dbMusic.find({}).then((musics) => {
      resolve(musics.filter((music) => !pathsToExclude.includes(music.filepath)));
    });
  });
}

async function loadMusicFiles(filePathArray: Array<String>) {
  if (filePathArray.length === 0) {
    logRed('No musics found! Please put mp3 files in the directory : ./mp3');
    process.exit(-1);
  }

  return new Promise<Array<IMusic>>((resolve) => {
    processDbLocalDiff(filePathArray).then(findEveryMusicAndFilter).then(resolve);
  });
}

function startPlaying(musics: Array<IMusic>) {
  global.MUSICS = musics;
  shuffleGlobalMusic();

  if (!fs.existsSync('./cover')) {
    fs.mkdirSync('./cover');
    logWhite('Created directory ./cover because it did not exist');
  }

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

async function firstInit() {
  await kuroshiro.init(new KuromojiAnalyzer());
}

exports.initMusic = () => {
  if (!fs.existsSync(mp3Directory)) {
    fs.mkdirSync('./mp3');
    logRed('No music directory! Please put mp3 files in the directory : ./mp3');
    process.exit(-1);
  }

  if (!global.PLAYING_START) {
    firstInit().then(() => {
      getFiles(mp3Directory).then(loadMusicFiles).then(startPlaying);
    });
  } else {
    getFiles(mp3Directory).then(loadMusicFiles).then(startPlaying);
  }
};
