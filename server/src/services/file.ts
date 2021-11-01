import fs from 'fs';
import { logRed, logYellow } from '../loaders/logger';

// create the directory if it doesn't exist
export function ensureDirectoryExists(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    logYellow(`Created directory ${dir} because it did not exist`);
  }
}

// if directory doesn't exist, create it and exit
export function ensureCoreDirectoryExists(dir: string, messageOnFail: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    logRed(`Created directory ${dir}, ${messageOnFail}`);
    process.exit(1);
  }
}
