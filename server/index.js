const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 3333;
const { PassThrough } = require('stream');
const Throttle = require('throttle');
const { ffprobeSync } = require('@dropb/ffprobe');

const writables = [];

const mp3path = './mp3'
const songs = fs.readdirSync(mp3path);
const playedSongs = [];

function playMusic() {
  if (songs.length === 0) {
    songs.push(...playedSongs);
    console.log("reloaded songs and now " + songs.length);
  }

  const song = songs.pop();
  const toPlay = mp3path + "/" + song;
  console.log(`will play ${song}`);
  playedSongs.push(song);

  const toPlayReadable = fs.createReadStream(toPlay);
  const bitrate = ffprobeSync(toPlay).format.bit_rate;
  const throttle = new Throttle(bitrate * 2);

  throttle.on('data', chunk => {
    for (const writable of writables) {
      writable.write(chunk);
    }
  }).on('end', () => playMusic());

  toPlayReadable.pipe(throttle);
}

playMusic();

app.get("/", (req, res) => {
  const anotherOne = PassThrough();
  writables.push(anotherOne);

  res.setHeader("Content-Type", "audio/mpeg");
    return anotherOne.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
