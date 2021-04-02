function timestamp() {
  const d = new Date();
  return `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}]`;
}

export function logRed(string: string) {
  console.log('\x1b[31m%s\x1b[0m', `${timestamp()} ${string}`);
}

export function logGreen(string: string) {
  console.log('\x1b[32m%s\x1b[0m', `${timestamp()} ${string}`);
}

export function logYellow(string: string) {
  console.log('\x1b[33m%s\x1b[0m', `${timestamp()} ${string}`);
}

export function logCyan(string: string) {
  console.log('\x1b[36m%s\x1b[0m', `${timestamp()} ${string}`);
}

export function logWhite(string: string) {
  console.log('\x1b[37m%s\x1b[0m', `${timestamp()} ${string}`);
}
