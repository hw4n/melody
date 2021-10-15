import * as mm from 'music-metadata';

export async function getCommonMetadata(filename) {
  return (await mm.parseFile(filename)).common;
}

export async function summarizeCommonMetadata(filename) {
  return getCommonMetadata(filename).then(commonMetadata => {
    const { title, artist, album } = commonMetadata;
    return `${title} / ${artist}\n${album}\n`;
  });
}
