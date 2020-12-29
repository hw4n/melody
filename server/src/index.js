require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT;
const { PassThrough } = require('stream');

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  pingTimeout: 1000 * 60 * 5,
  pingInterval: 1000 * 10,
  cors: {
    origin: "*"
  }
});
const loader = require("./loaders");
const coverDirectory = "./cover";

loader.initMusic();

app.use(express.static(path.join(__dirname, "../", coverDirectory)));

server.listen(PORT, () => {
  loader.logWhite(`Server listening at port ${PORT}`);
});

const apiRoutes = require("./api");
app.use("/", apiRoutes);
