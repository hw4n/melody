import path, { basename } from 'path';
import fs from 'fs';

import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import { initializeSocket } from '../services/socket';
import { logGreen, logRed, logWhite } from './logger';
import dbMusic, { IMusic } from '../models/Music';
import diff from '../services/diff';
import initReadline from '../services/console';
import { sameMusicHasLyrics } from '../services/db';

initReadline();

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
  // we need to find every music in the db
  const dbMusics = await dbMusic.find({});

  // find out difference between paths from db and local
  // before invoking diff, we need to convert arrays to sets
  const dbSet = new Set(dbMusics.map((music) => music.filepath));
  const localSet = new Set(filePathArray);
  const dbOnly = diff(dbSet, localSet);
  const localOnly = diff(localSet, dbSet);

  // add every music that does not exist in the db
  const newMusics = await analyzeMusics(localOnly);
  const inserted = await insertMusics(newMusics);

  // exclude every music that is not available locally
  // dbMusics + inserted = all musics in db
  // so, we can concat dbMusics and inserted to get all musics without querying db again
  const allMusics = dbMusics.concat(inserted);

  // allMusics - dbOnly = locally available musics
  // thus, we can filter out all musics that are not available locally
  const locallyAvailableMusics = allMusics.filter((music) => !dbOnly.includes(music.filepath));

  // finally, return locally available musics
  return locallyAvailableMusics;
}

async function applyLyricsIfPresentInDB(musics: Array<IMusic>) {
  musics.forEach(async (music) => {
    const [availabe, lyricData] = await sameMusicHasLyrics(music);
    // don't apply lyrics if not found or already has lyrics
    if (!availabe || music.lyrics) return;
    logGreen(`Applying lyrics to ${music.title} (${music.id})`);
    dbMusic.findByIdAndUpdate(music.id, lyricData);
  });
}

// filePathArray is an array of every mp3 file in the mp3 directory
async function loadMusicFiles(filePathArray: Array<String>) {
  // array is empty, which means there is no music in the directory
  if (filePathArray.length === 0) {
    logRed('No musics found! Please put mp3 files in the directory : ./mp3');
    process.exit(-1);
  }

  const locallyAvailableMusics = await processDbLocalDiff(filePathArray);
  // no await here, because we don't need to wait for this to finish
  applyLyricsIfPresentInDB(locallyAvailableMusics);

  logWhite('Emptying global music object and queue array');
  global.PLAYING = null;
  global.QUEUE = [];

  logWhite(`Refilling global music array with ${locallyAvailableMusics.length} music`);
  global.MUSICS = locallyAvailableMusics;
}

async function startPlaying() {
  shuffleGlobalMusic();

  if (!fs.existsSync('./cover')) {
    fs.mkdirSync('./cover');
    logWhite('Created directory ./cover because it did not exist');
  }

  await playMusic();
}

// scan directory for mp3 files
async function scanMp3(dir: string) {
  // get sub directories and files in the directory
  const subdirs = fs.readdirSync(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    // get an absolute path to the sub directory or file
    const absolutePath = path.resolve(dir, subdir);
    const stat = fs.statSync(absolutePath);
    // if it was a directory, recurse
    return stat.isDirectory() ? scanMp3(absolutePath) : absolutePath;
  }));
  // merge all the files together in one array,
  // filter non-mp3 files and return
  return (files
    .reduce((a: Array<string>, f: string) => a.concat(f), [])
    .filter((file: string) => path.extname(file) === '.mp3')
  );
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
  const mp3 = await scanMp3(mp3Directory);
  await loadMusicFiles(mp3);
  await startPlaying();
  initializeSocket();
}
