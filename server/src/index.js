import { logWhite } from './loaders/logger';

require('dotenv').config();

const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: { origin: '*' },
});

global.SOCKET = io;

const apiRoutes = require('./api');
const loader = require('./loaders');

const { PORT, STAGE } = process.env;

app.use('/', apiRoutes);
app.use(express.static('cover'));
if (STAGE === 'live') {
  app.use(express.static('build'));
}
server.listen(PORT, () => {
  logWhite(`Server listening at port ${PORT}`);
});

loader.initMusic();
