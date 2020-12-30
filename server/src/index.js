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

const apiRoutes = require('./api');
const loader = require('./loaders');

const { PORT } = process.env;

app.use('/', apiRoutes);
app.use(express.static('cover'));
server.listen(PORT, () => {
  logWhite(`Server listening at port ${PORT}`);
});

global.SOCKET = io;
const socket = require('./services/socket');

socket.addListeners(io);

loader.initMusic();
