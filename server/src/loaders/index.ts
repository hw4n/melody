import { basename } from 'path';

import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import { initializeSocket } from '../services/socket';
import { logGreen, logRed, logWhite } from './logger';
import dbMusic, { IMusic } from '../models/Music';
import diff from '../services/diff';
import initReadline from '../services/console';
import { sameMusicHasLyrics } from '../services/db';

initReadline();

const fs = require('fs');
const { resolve: pathResolve } = require('path');
const { promisify } = require('util');
const { ffprobe } = require('@dropb/ffprobe');
require('dotenv').config();

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

async function findEveryMusicAndFilter(pathsToExclude: Array<String>): Promise<IMusic[]> {
  return dbMusic.find({})
    .then((musics) => {
      logWhite('Excluding musics from DB that does not exist locally');
      return Promise.resolve(musics.filter((music) => !pathsToExclude.includes(music.filepath)));
    });
}

async function applyLyricsIfPresentInDB(musics: Array<IMusic>) {
  await Promise.all(
    musics.map(async (music) => {
      // skip when lyrics are already available
      if (music.lyrics) {
        return music;
      }
      const [foundLyric, lyricData] = await sameMusicHasLyrics(music);
      if (foundLyric) {
        dbMusic.findByIdAndUpdate({ _id: music.id }, lyricData)
          .then((updatedMusic) => {
            logGreen(`Applied lyrics to ${music.title} (${music.id} -> ${updatedMusic.id})`);
          });
      }
      return music;
    }),
  );
  return musics;
}

async function loadMusicFiles(filePathArray: Array<String>) {
  if (filePathArray.length === 0) {
    logRed('No musics found! Please put mp3 files in the directory : ./mp3');
    process.exit(-1);
  }

  return processDbLocalDiff(filePathArray)
    .then(findEveryMusicAndFilter)
    .then(applyLyricsIfPresentInDB)
    .then((musics) => {
      logWhite('Emptying global music object and queue array');
      global.PLAYING = null;
      global.QUEUE = [];

      logWhite(`Refilling global music array with ${musics.length} music`);
      global.MUSICS = musics;
      return Promise.resolve();
    });
}

async function startPlaying() {
  shuffleGlobalMusic();

  if (!fs.existsSync('./cover')) {
    fs.mkdirSync('./cover');
    logWhite('Created directory ./cover because it did not exist');
  }

  return playMusic().then(() => Promise.resolve());
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// scan directory for mp3 files
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

export default async function initMusic() {
  // directory storing mp3 files should present in the root directory
  if (!fs.existsSync(mp3Directory)) {
    fs.mkdirSync('./mp3');
    logRed('No music directory! Please put mp3 files in the directory : ./mp3');
    process.exit(-1);
  }

  // initializing for the first time -> kuroshiro must be initialized before anything else
  if (!global.PLAYING_START) {
    await firstInit();
  }
  const mp3 = await getFiles(mp3Directory);
  await loadMusicFiles(mp3);
  await startPlaying();
  initializeSocket();
}
