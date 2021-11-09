import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';

import { logWhite } from './loaders/logger';
import initMusic from './loaders';
import Global from './interfaces/Global';
import apiRoutes from './api';

declare let global: Global;

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: { origin: '*' },
});

global.SOCKET = io;

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

initMusic();
