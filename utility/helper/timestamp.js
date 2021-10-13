export function isTimestmap(string) {
  return /\[\d*:\d*:\d+\.{0,1}\d*]/.exec(string)
}

export function secondsToStamp(seconds) {
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  seconds %= 3600;
  const m = Math.floor(seconds / 60);
  seconds %= 60
  return `[${h}:${m}:${seconds}]`
}

export function timestampToSeconds(timestamp) {
  const [h, m, s] = timestamp.slice(1, timestamp.length-1).split(":");
  let seconds = 0;
  seconds += h ? Number(h) * 3600 : 0;
  seconds += m ? Number(m) * 60 : 0;
  seconds += s ? Number(s) : 0;
  return seconds;
}
