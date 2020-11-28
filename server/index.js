const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const PORT = 3333;
const { PassThrough } = require('stream');
const Throttle = require('throttle');
const { ffprobeSync, ffprobe } = require('@dropb/ffprobe');
const { resolve } = require("path");
const { rejects } = require("assert");
const { promisify } = require("util");
const { start } = require("repl");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});
const ffmpeg = require('fluent-ffmpeg');
const { on } = require("process");
const { error } = require("console");

class Music {
  constructor(music) {
    this.duration = music.duration,
    this.bit_rate = music.bit_rate,
    this.title = music.title,
    this.album = music.album,
    this.file = music.file,
    this.artist = music.artist,
    this.id = music.id
  }
}

const writables = [];

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const mp3path = './mp3'
const preload = [];
const songs = [];
const playedSongs = [];
let coverBuffer;

let nowPlaying = {};

function getCoverArt(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving cover art from ${filePath}`);
    ffmpeg(filePath)
      .output("./cover.png")
      .on("end", () => {
        console.log("Retrieving cover art: Completed");
        resolve();
      }).run();
  })
}

function playMusic() {
  if (songs.length === 0) {
    songs.push(...shuffle(playedSongs));
    playedSongs.length = 0;
    console.log(`Reloaded and shuffled ${songs.length} songs"`);
  }

  let song;
  if (userQueue.length > 0) {
    song = userQueue.shift();
    console.log(`Will play from userQ: ${song.title}`);
  } else {
    song = songs.shift();
    console.log(`Will play from songs: ${song.title}`);
  }

  const toPlay = song.file;
  nowPlaying = song;

  const toPlayReadable = fs.createReadStream(toPlay);
  const throttle = new Throttle(song.bit_rate / 8);

  throttle.on('data', chunk => {
    for (let i = writables.length - 1; i >= 0; i--) {
      if (writables[i]._readableState.pipesCount === 0) {
        writables.splice(i, 1);
      } else {
        writables[i].write(chunk);
      }
    }
  }).on('end', () => {
    playedSongs.push(song);
    playMusic();
  });

  toPlayReadable.pipe(throttle);

  getCoverArt(toPlay).then(() => {
    fs.readFile("./cover.png", function(err, data) {
      coverBuffer = new Buffer.from(data).toString('base64');
      io.sockets.emit("data", {
        priority: userQueue,
        queue: songs,
        played: playedSongs,
        playing: {
          ...nowPlaying,
          cover: coverBuffer
        }
      });
    });
  });
}

const filterWords = ["カラオケ", "リミックス", "Ver.", "Off Vocal", "(オリジナル", "VERSION)", "ソロ", "Bonus Track", "ラジオ"];

const loadMusicFiles = async(filePathArray) => {
  console.log("Begin loading music files");
  let processCounter = 0;
  for (let i = 0; i < filePathArray.length; i++) {
    process.stdout.write(`Begin processing ${i} musics\r`);
    const filePath = filePathArray[i];
    
    ffprobe(filePath)
      .then(data => {
        processCounter += 1;
        id = processCounter;

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
  
        preload.push(new Music({id, duration, bit_rate, title, album, artist, file: filePath}));

        if (processCounter === filePathArray.length - 1) {
          startPlaying();
        }
      })
  };
};

function startPlaying() {
  console.log(`Total number of music is: ${preload.length}`);
          
  songs.push(...shuffle(preload));
  console.log("Shuffle done");
  preload.length = 0;

  playMusic();
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

getFiles("./mp3").then(loadMusicFiles);

const userQueue = [];

io.on("connection", socket => {
  socket.emit("data", {
    priority: userQueue,
    queue: songs,
    played: playedSongs,
    playing: {
      ...nowPlaying,
      cover: coverBuffer
    }
  });

  socket.on("queue", musicId => {
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (song.id === musicId) {
        userQueue.push(songs.splice(i, 1)[0]);
        console.log(`Pushed to userQueue: ${song.title}`);

        io.sockets.emit("data", {
          priority: userQueue,
          queue: songs,
          played: playedSongs,
          playing: {
            ...nowPlaying,
            cover: coverBuffer
          }
        });
        break;
      }
    }
  })
});

app.get("/stream", (req, res) => {
  const anotherOne = PassThrough();
  writables.push(anotherOne);

  res.setHeader("Content-Type", "audio/mpeg");
    return anotherOne.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
