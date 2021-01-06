import { logCyan } from '../loaders/logger';

const express = require('express');

const router = express.Router();
const { PassThrough } = require('stream');

router.get('/stream', (req, res) => {
  if (global.SOCKETS.includes(req.query.id)) {
    const anotherOne = PassThrough();
    global.WRITABLES[req.query.id] = anotherOne;
    logCyan(`Added ${req.query.id} to writables`);

    res.setHeader('Content-Type', 'audio/mpeg');
    return anotherOne.pipe(res);
  }
  return res.status(401).send();
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
  });
});

module.exports = router;
