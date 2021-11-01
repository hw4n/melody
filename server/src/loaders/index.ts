import path, { basename } from 'path';
import fs from 'fs';
import { ffprobe } from '@dropb/ffprobe';

import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import { initializeSocket } from '../services/socket';
import { logGreen, logRed, logWhite } from './logger';
import dbMusic, { IMusic, IStoredMusic } from '../models/Music';
import diff from '../services/diff';
import initReadline from '../services/console';
import { sameMusicHasLyrics } from '../services/db';
import { ensureDirectoryExists, ensureCoreDirectoryExists } from '../services/file';

initReadline();

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

async function analyzeMusic(filepath: string): Promise<IMusic> {
  const metadata = await ffprobe(filepath);
  const { duration, size, bit_rate: bitrate } = metadata.format;
  const {
    // fallbacks when metadata is not available
    title = basename(filepath, 'mp3'),
    album = '-',
    artist = 'Various Artists',
  } = metadata.format.tags;
  const romaji = {
    title: await toRomaji(title),
    artist: await toRomaji(artist),
  };
  return {
    duration: Number(duration),
    size: Number(size),
    bitrate: Number(bitrate),
    title,
    album,
    artist,
    filepath,
    romaji,
  };
}

async function analyzeMusics(filepaths: Array<String>) {
  return Promise.all(filepaths.map(analyzeMusic));
}

async function insertMusics(musics: Array<IMusic>) {
  logWhite(`Inserting ${musics.length} music into DB`);
  const inserted = await dbMusic.insertMany(musics);
  return inserted;
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

async function applyLyricsIfPresentInDB(musics: Array<IStoredMusic>) {
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

  ensureDirectoryExists('./cover');

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
  ensureCoreDirectoryExists(mp3Directory, 'Please put mp3 files in the directory');

  // initializing for the first time -> kuroshiro must be initialized before anything else
  if (!global.PLAYING_START) {
    await firstInit();
  }
  const mp3 = await scanMp3(mp3Directory);
  await loadMusicFiles(mp3);
  await startPlaying();
  initializeSocket();
}
