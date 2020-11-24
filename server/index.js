const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 3333;
const { PassThrough } = require('stream');
const Throttle = require('throttle');
const { ffprobeSync } = require('@dropb/ffprobe');

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

  const song = songs.pop();
  const toPlay = mp3path + "/" + song;
  console.log(`will play ${song}`);
  nowPlaying.title = song;
  playedSongs.unshift(song);

  const toPlayReadable = fs.createReadStream(toPlay);
  const bitrate = ffprobeSync(toPlay).format.bit_rate;
  const throttle = new Throttle(bitrate / 8);

  throttle.on('data', chunk => {
    for (const writable of writables) {
      writable.write(chunk);
    };
  }).on('end', () => playMusic());

  toPlayReadable.pipe(throttle);
}

playMusic();

app.get("/nowplaying", (req, res) => {
  res.json(nowPlaying)
});

app.get("/queue", (req, res) => {
  res.json({
    in_queue: songs,
    played: playedSongs,
  });
});

app.get("/stream", (req, res) => {
  const anotherOne = PassThrough();
  writables.push(anotherOne);

  res.setHeader("Content-Type", "audio/mpeg");
    return anotherOne.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
