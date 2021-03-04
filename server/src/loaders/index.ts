import Global from '../interfaces/Global';
import { shuffleGlobalMusic, playMusic } from '../services/music';
import addSocketListeners from '../services/socket';
import { logWhite } from './logger';
import dbMusic, { IMusic } from '../models/Music';

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
}, () => {
  logWhite('Connected to DB');
});

async function toRomaji(japanese) {
  const result = await kuroshiro.convert(japanese, { to: 'romaji', romajiSystem: 'passport' });
  return result;
}

async function loadMusicFiles(filePathArray) {
  await kuroshiro.init(new KuromojiAnalyzer());
  return new Promise<void>((resolve) => {
    dbMusic.countDocuments({}, (err, count) => {
      // same number of musics are on db
      if (count === filePathArray.length) {
        logWhite(`Using same ${count} musics from DB`);
        dbMusic.find({}, (error, musics) => {
          musics.forEach((music, index) => {
            global.MUSICS.push(music);
            if (index === filePathArray.length - 1) {
              resolve();
            }
          });
        });
        return;
      }
      logWhite(`${filePathArray.length} musics found, started loading`);
      dbMusic.deleteMany(() => {
        logWhite('Will renew collection on DB');
        const processedMusic = [];
        filePathArray.forEach((filepath, index) => {
          ffprobe(filepath)
            .then((data) => {
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
                  processedMusic.push(music);
                });

              if (index === filePathArray.length - 1) {
                dbMusic.insertMany(processedMusic).then((musics) => {
                  logWhite(`Inserted ${musics.length} musics to DB`);
                  musics.forEach((music, idx) => {
                    global.MUSICS.push(music);
                    if (idx === musics.length - 1) {
                      resolve();
                    }
                  });
                });
              }
            });
        });
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
