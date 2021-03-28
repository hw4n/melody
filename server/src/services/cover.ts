import ffmpeg from 'fluent-ffmpeg';

export default function getCoverArt(filePath) {
  return new Promise<void>((resolve) => {
    ffmpeg(filePath)
      .output('./cover/96.png')
      .size('96x96')
      .output('./cover/128.png')
      .size('128x128')
      .output('./cover/192.png')
      .size('192x192')
      .output('./cover/256.png')
      .size('256x256')
      .output('./cover/384.png')
      .size('384x384')
      .output('./cover/512.png')
      .size('512x512')
      .on('end', () => {
        resolve();
      })
      .run();
  });
}
