import { createReadStream } from 'fs';
import { logCyan } from '../loaders/logger';

const express = require('express');

const router = express.Router();
const { PassThrough } = require('stream');

router.get('/stream', (req, res) => {
  const filePath = global.PLAYING.file;
  const fileSize = global.PLAYING.size;
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
    writables: {
      length: Object.keys(global.WRITABLES).length,
      keys: Object.keys(global.WRITABLES),
    },
    queue: global.QUEUE,
    musics: global.MUSICS,
  });
});

module.exports = router;
