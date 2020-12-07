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

let nowPlaying = {};

function getCoverArt(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`Retrieving cover art from ${filePath}`);
    ffmpeg(filePath)
      .output("./cover/96.png")
      .size("96x96")
      .output("./cover/128.png")
      .size("128x128")
      .output("./cover/192.png")
      .size("192x192")
      .output("./cover/256.png")
      .size("256x256")
      .output("./cover/384.png")
      .size("384x384")
      .output("./cover/512.png")
      .size("512x512")
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
  let FROM_QUEUE;
  if (userQueue.length > 0) {
    song = userQueue.shift();
    console.log(`Will play from userQ: ${song.title}`);
    FROM_QUEUE = "priority";
  } else {
    song = songs.shift();
    console.log(`Will play from songs: ${song.title}`);
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

function minimizeMusicObject(music) {
  const { duration, title, album, artist, id } = music
  return {
    duration,
    title,
    album,
    artist,
    id
  }
}

function minimizeMusicArray(musicArray) {
  return musicArray.map(music => minimizeMusicObject(music));
}

const connectedSocketIds = [];

io.on("connection", socket => {
  connectedSocketIds.push(socket.id);
  console.log(`Added ${socket.id} to connectedSocketIds[]`);

  socket.emit("init", {
    priority: minimizeMusicArray(userQueue),
    queue: minimizeMusicArray(songs),
    played: minimizeMusicArray(playedSongs),
    playing: minimizeMusicObject(nowPlaying)
  });

  socket.on("priority", musicId => {
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (song.id === musicId) {
        userQueue.push(songs.splice(i, 1)[0]);
        console.log(`Pushed to userQueue: ${song.title}`);
        io.sockets.emit("priority", song.id);
        break;
      }
    }
  })

  socket.on("disconnect", () => {
    for (const socketId of Object.keys(writables)) {
      if (socketId === socket.id) {
        delete writables[socketId];
        console.log(`Removed ${socketId} from writables`);
        break;
      }
    }

    for (let i = 0; i < connectedSocketIds.length; i++) {
      if (connectedSocketIds[i] === socket.id) {
        connectedSocketIds.splice(i, 1);
        console.log(`Removed ${socket.id} from connectedSocketIds[]`);
        break;
      }
    }
  });
});

app.use(express.static(path.join(__dirname, "cover")));

const writables = {};

app.get("/stream", (req, res) => {
  if (connectedSocketIds.includes(req.query.id)) {
    const anotherOne = PassThrough();
    writables[req.query.id] = anotherOne;
    console.log(`Added ${req.query.id} to writables`);

    res.setHeader("Content-Type", "audio/mpeg");
    return anotherOne.pipe(res);
  } else {
    return res.status(401).send("");
  }
});

server.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
