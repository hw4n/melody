require("dotenv").config();

const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT;
const { PassThrough } = require('stream');
const Throttle = require('throttle');
const { ffprobe } = require('@dropb/ffprobe');
const { resolve } = require("path");
const { promisify } = require("util");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: {
    origin: "*"
  }
});
const ffmpeg = require('fluent-ffmpeg');

app.use(express.static(path.join(__dirname, "../", coverDirectory)));

server.listen(PORT, () => {
  logWhite(`Server listening at port ${PORT}`);
});

const apiRoutes = require("./api");
app.use("/", apiRoutes);
