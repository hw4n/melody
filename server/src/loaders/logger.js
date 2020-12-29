exports.timestamp = () => {
  const d = new Date();
  return `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}]`;
}

exports.logCyan = (string) => {
  console.log("\x1b[36m%s\x1b[0m", `${exports.timestamp()} ${string}`);
}

exports.logWhite = (string) => {
  console.log("\x1b[37m%s\x1b[0m", `${exports.timestamp()} ${string}`);
}
