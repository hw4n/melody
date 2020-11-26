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
const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});

class Music {
  constructor(music) {
    this.duration = music.duration,
    this.bit_rate = music.bit_rate,
    this.title = music.title,
    this.album = music.album,
    this.file = music.file,
    this.artist = music.artist
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
const songs = [];
const playedSongs = [];

let nowPlaying = {};

function playMusic() {
  if (songs.length === 0) {
    songs.push(...shuffle(playedSongs));
    playedSongs.length = 0;
    console.log("reloaded songs and now " + songs.length);
  }

  const song = songs.shift();
  const toPlay = mp3path + "/" + song.file;
  console.log(`will play ${song.title}`);
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

  setTimeout(() => {
    io.sockets.emit("data", {
      queue: songs,
      played: playedSongs,
      playing: nowPlaying,
    });
  }, 2000);
}

// playMusic();

const loadMusicFiles = new Promise((resolve, reject) => {
  fs.readdirSync(mp3path).forEach((file, index, array) => {
    const absolutePath = path.resolve(mp3path, file );
    ffprobe(absolutePath)
      .then(data => {
        let { duration, bit_rate } = data.format;
        const m = Math.floor(duration / 60);
        const s = Math.floor(duration - m * 60);
        duration = `${m}:${s.toString().padStart(2, 0)}`;
        let { title, album, artist } = data.format.tags;
        if (title === undefined) {
          title = file.substr(0, file.lastIndexOf("."));
        }
        if (album === undefined) {
          album = "-";
        }
        if (artist === undefined) {
          artist = "Various Artists";
        }
  
        songs.push(new Music({duration, bit_rate, title, album, artist, file}));

        if (index === array.length - 1) {
          resolve();
        }
      });
  });
});

loadMusicFiles.then(() => {
  playMusic();
})

io.on("connection", socket => {
  socket.emit("data", {
    queue: songs,
    played: playedSongs,
    playing: nowPlaying,
  });
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
