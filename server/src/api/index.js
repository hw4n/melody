import { createReadStream } from 'fs';
import dbMusic from '../models/Music';
import { logGreen } from '../loaders/logger';
import { broadcastLyricChange } from '../services/socket';

const express = require('express');

const router = express.Router();

router.get('/stream', (req, res) => {
  const { filepath: filePath, size: fileSize } = global.PLAYING;
  const { range } = req.headers;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const readStream = createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    readStream.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    createReadStream(filePath).pipe(res);
  }
});

router.get('/status', (req, res) => {
  res.status(200).json({
    sockets: {
      length: global.SOCKETS.length,
      array: global.SOCKETS,
    },
    queue: global.QUEUE,
    musics: global.MUSICS,
    playing: global.PLAYING,
    start: global.PLAYING_START,
  });
});

router.get('/lyrics', (req, res) => {
  dbMusic.findById(global.PLAYING.id).then((music) => {
    res.status(200).json({
      lyrics: music.lyrics || '',
      synced: music.synced || false,
    });
  });
});

router.post('/lyrics', (req, res) => {
  const { lyrics, synced } = req.body;
  dbMusic.findOneAndUpdate({
    _id: global.PLAYING.id,
  }, {
    lyrics,
    synced,
  }).then((music) => {
    logGreen(`Lyrics updated for ${music.title}(${music.id})`);
    res.sendStatus(200);
    global.PLAYING.lyrics = lyrics;
    global.PLAYING.synced = synced;
    broadcastLyricChange({
      lyrics: lyrics ? lyrics.length > 0 : false,
      synced,
    });
  });
});

module.exports = router;
