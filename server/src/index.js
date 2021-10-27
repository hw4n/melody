import { logWhite } from './loaders/logger';

require('dotenv').config();

const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: { origin: '*' },
});
const path = require('path');

global.SOCKET = io;

const apiRoutes = require('./api');
const loader = require('./loaders');

const { PORT, STAGE } = process.env;
app.use('/api', apiRoutes);
app.use(express.static('cover'));
if (STAGE === 'live') {
  app.use(express.static('build'));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}
server.listen(PORT, () => {
  logWhite(`Server listening at port ${PORT}`);
});

loader.initMusic();
