const fs = require("fs");
const { resolve } = require("path");
const { promisify } = require("util");
const { ffprobe } = require('@dropb/ffprobe');

const { logWhite } = require("./logger");
exports.logWhite = logWhite;

const mp3Directory = "./mp3";

global.PLAYING = {};
global.MUSICS = [];
global.QUEUE = [];
global.WRITABLES = {};
global.SOCKETS = [];

import Music from "../interfaces/Music";

const loadMusicFiles = async(filePathArray) => {
  return new Promise((resolve, reject) => {
    logWhite(`${filePathArray.length} musics found, started loading`);
    let processCounter = 0;
    for (let i = 0; i < filePathArray.length; i++) {
      const filePath = filePathArray[i];

      ffprobe(filePath)
        .then(data => {
          processCounter += 1;
          let id = processCounter;

          let { duration, bit_rate } = data.format;
          const m = Math.floor(duration / 60);
          const s = Math.floor(duration - m * 60);
          duration = `${m}:${s.toString().padStart(2, 0)}`;
          let { title, album, artist } = data.format.tags;
          if (title === undefined) {
            title = filePath.substr(0, filePath.lastIndexOf("."));
          }

          if (album === undefined) {
            album = "-";
          }
          if (artist === undefined) {
            artist = "Various Artists";
          }

          global.MUSICS.push(new Music({id, duration, bit_rate, title, album, artist, file: filePath}));
          process.stdout.write(`Processed music, id ${id}\r`);

          if (processCounter === filePathArray.length) {
            resolve();
          }
        })
    };
  });
};

import playMusic from "../services/music";

function startPlaying() {
  playMusic();
  logWhite("Streaming started");
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []).filter(f => f.endsWith(".mp3"));
}

exports.initMusic = () => {
  getFiles(mp3Directory).then(loadMusicFiles).then(startPlaying);
}
