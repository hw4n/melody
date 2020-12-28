const loadMusicFiles = async(filePathArray) => {
  logWhite(`${filePathArray.length} musics found, started loading`);
  let processCounter = 0;
  for (let i = 0; i < filePathArray.length; i++) {
    const filePath = filePathArray[i];

    ffprobe(filePath)
      .then(data => {
        processCounter += 1;
        id = processCounter;

        let { duration, bit_rate } = data.format;
        const m = Math.floor(duration / 60);
        const s = Math.floor(duration - m * 60);
        duration = `${m}:${s.toString().padStart(2, 0)}`;
        let { title, album, artist } = data.format.tags;
        if (title === undefined) {
          title = filePath.substr(0, filePath.lastIndexOf("."));
        }

        if (album === undefined) {
          album = "-";
        }
        if (artist === undefined) {
          artist = "Various Artists";
        }
  
        preload.push(new Music({id, duration, bit_rate, title, album, artist, file: filePath}));
        process.stdout.write(`Processed music, id ${id}\r`);

        if (processCounter === filePathArray.length) {
          startPlaying();
        }
      })
  };
};

function startPlaying() {
  songs.push(...shuffle(preload));
  preload.length = 0;

  playMusic();
  logWhite("Streaming started");
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []).filter(f => f.endsWith(".mp3"));
}

getFiles(mp3Directory).then(loadMusicFiles);
