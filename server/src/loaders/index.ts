import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import addSocketListeners from '../services/socket';
import { logWhite } from './logger';
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
      let { title, album, artist } = data.format.tags;
      if (title === undefined) {
        title = filepath.substr(0, filepath.lastIndexOf('.'));
      }

      if (album === undefined) {
        album = '-';
      }
      if (artist === undefined) {
        artist = 'Various Artists';
      }

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

async function loadMusicFiles(filePathArray: Array<String>) {
  logWhite(`${filePathArray.length} music found from local`);
  await kuroshiro.init(new KuromojiAnalyzer());
  return new Promise<Array<IMusic>>((resolve) => {
    dbMusic.find({}, (err, dbMusics) => {
      logWhite(`${dbMusics.length} music found from DB`);
      const dbSet = new Set(dbMusics.map((music) => music.filepath));
      const localSet = new Set(filePathArray);
      const dbOnly = diff(dbSet, localSet);
      logWhite(`${dbOnly.length} music not found from local files`);
      const localOnly = diff(localSet, dbSet);
      logWhite(`${localOnly.length} music not found from DB and will insert`);
      Promise.all(localOnly.map((filepath) => analyzeMusic(filepath)))
        .then((processedMusic) => {
          dbMusic.insertMany(processedMusic).then(() => {
            logWhite(`Inserted ${localOnly.length} music to DB`);
            dbMusic.find({}, (error, musics) => {
              logWhite(`Will exclude ${dbOnly.length} music from playlist`);
              resolve(musics.filter((music) => !dbOnly.includes(music.filepath)));
            });
          });
        });
    });
  });
}

function startPlaying(musics: Array<IMusic>) {
  global.MUSICS.push(...musics);
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
