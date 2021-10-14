import { createRequire } from "module";
const require = createRequire(import.meta.url);

import Audic from 'audic';
import fs from 'fs';
import { secondsToStamp } from "./helper/timestamp.js";
const ioHook = require('iohook');

const lyrics = fs.readFileSync('lyric_source', 'utf8').split("\n").map(x => x.trim()).filter(x => x.length > 0);
// empty lyric_output
fs.writeFileSync("lyric_output", '');

const startTime = new Date();

// i don't know if there are 2+ mp3 files
let filename = '';
for (const file of fs.readdirSync('./')) {
  if (file.includes(".mp3")) {
    filename = file;
    break;
  }
}

const audic = new Audic(filename);
await audic.play();

ioHook.on('keydown', (event) => {
  let block = "";

  switch (event.keycode) {
    case 2: // 1, append 1 line from source
      block += lyrics.shift() + '\n';
      break;
    case 4: // 3, append 3 lines from source
      block += lyrics.shift() + '\n';
      block += lyrics.shift() + '\n';
      block += lyrics.shift() + '\n';
      break;
  }

  const secondsFromStart = (new Date() - startTime) / 1000;

  fs.appendFileSync('lyric_output', `${secondsToStamp(secondsFromStart)}\n`);
  fs.appendFileSync('lyric_output', block);
});

ioHook.start();