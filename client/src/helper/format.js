export function secondsToTimestring(x) {
  // if total length is less than a hour
  if (x < 3600) {
    const m = Math.floor(x / 60);
    const s = Math.floor(x % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  } else {
    const h = Math.floor(x / 3600);
    const m = Math.floor(x % 3600 / 60).toString().padStart(2, "0");
    const s = Math.floor(x % 3600 % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
}
