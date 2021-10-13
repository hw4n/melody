import fs from 'fs';
import { isTimestmap, secondsToStamp, timestampToSeconds } from './helper/timestamp.js';

const lyrics = fs.readFileSync('lyric_output', 'utf8').split("\n");
const shifted = [];
const shiftMs = 1134;

for (const line of lyrics) {
  if (isTimestmap(line)) {
    let seconds = timestampToSeconds(line);
    let shiftedTimestamp = secondsToStamp(seconds + (shiftMs) / 1000);
    shifted.push(shiftedTimestamp);
  } else {
    shifted.push(line);
  }
}

for (const s of shifted) {
  fs.appendFileSync('lyric_output_shifted', s + "\n");
}
