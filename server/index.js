const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 3333;
const { PassThrough } = require('stream');
const Throttle = require('throttle');
const { ffprobeSync } = require('@dropb/ffprobe');
const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*"}});

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
const songs = shuffle(fs.readdirSync(mp3path));
const playedSongs = [];

const nowPlaying = {
  title: "",
}

function playMusic() {
  if (songs.length === 0) {
    songs.push(...shuffle(playedSongs));
    playedSongs.length = 0;
    console.log("reloaded songs and now " + songs.length);
  }

  const song = songs.shift();
  const toPlay = mp3path + "/" + song;
  console.log(`will play ${song}`);
  nowPlaying.title = song;
  playedSongs.push(song);

  const toPlayReadable = fs.createReadStream(toPlay);
  const bitrate = ffprobeSync(toPlay).format.bit_rate;
  const throttle = new Throttle(bitrate / 8);

  throttle.on('data', chunk => {
    for (let i = writables.length - 1; i >= 0; i--) {
      if (writables[i]._readableState.pipesCount === 0) {
        writables.splice(i, 1);
      } else {
        writables[i].write(chunk);
      }
    }
  }).on('end', () => playMusic());

  toPlayReadable.pipe(throttle);

  io.sockets.emit("data", {
    queue: songs,
    played: playedSongs,
    playing: nowPlaying,
  });
}

playMusic();

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
