io.on("connection", socket => {
  connectedSocketIds.push(socket.id);
  logCyan(`${socket.id} connected, ${socket.handshake.headers['user-agent']}`);

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
        io.sockets.emit("priority", song.id);
        break;
      }
    }
  })

  socket.on("disconnect", (reason) => {
    logCyan(`${socket.id}: ${reason}`);
    delete writables[socket.id];

    for (let i = 0; i < connectedSocketIds.length; i++) {
      if (connectedSocketIds[i] === socket.id) {
        connectedSocketIds.splice(i, 1);
        logCyan(`Removed ${socket.id}, ${socket.handshake.headers['user-agent']}`);
        break;
      }
    }
  });
});
