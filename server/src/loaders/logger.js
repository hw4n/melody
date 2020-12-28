function timestamp() {
  const d = new Date();
  return `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}]`;
}

function logCyan(string) {
  console.log("\x1b[36m%s\x1b[0m", `${timestamp()} ${string}`);
}

function logWhite(string) {
  console.log("\x1b[37m%s\x1b[0m", `${timestamp()} ${string}`);
}
