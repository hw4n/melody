const fs = require("fs");
const Throttle = require('throttle');

import getCoverArt from "../services/cover";

const nowPlaying = global.PLAYING;
const songs = global.MUSICS;
const userQueue = global.QUEUE;
const writables = global.WRITABLES;

export default function playMusic() {
  if (songs.length === 0) {
    songs.push(...shuffle(playedSongs));
    playedSongs.length = 0;
    logWhite(`Reloaded and shuffled ${songs.length} musics`);

    io.sockets.emit("init", {
      priority: minimizeMusicArray(userQueue),
      queue: minimizeMusicArray(songs),
      played: minimizeMusicArray(playedSongs),
      playing: {},
    });
  }

  let song;
  let FROM_QUEUE;
  if (userQueue.length > 0) {
    song = userQueue.shift();
    FROM_QUEUE = "priority";
  } else {
    song = songs.shift();
    FROM_QUEUE = "queue";
  }

  const toPlay = song.file;
  nowPlaying = song;

  const toPlayReadable = fs.createReadStream(toPlay);
  const throttle = new Throttle(song.bit_rate / 8);

  throttle.on('data', chunk => {
    for (const writable of Object.values(writables)) {
      writable.write(chunk);
    }
  }).on('end', () => {
    playedSongs.push(song);
    playMusic();
  });

  toPlayReadable.pipe(throttle);

  getCoverArt(toPlay).then(() => {
    setTimeout(() => {
      io.sockets.emit("playNext", {
        FROM_QUEUE,
        id: song.id
      });
    }, 3000);
  });
}
