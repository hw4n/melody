function getCoverArt(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .output(`${coverDirectory}/96.png`)
      .size("96x96")
      .output(`${coverDirectory}/128.png`)
      .size("128x128")
      .output(`${coverDirectory}/192.png`)
      .size("192x192")
      .output(`${coverDirectory}/256.png`)
      .size("256x256")
      .output(`${coverDirectory}/384.png`)
      .size("384x384")
      .output(`${coverDirectory}/512.png`)
      .size("512x512")
      .on("end", () => {
        resolve();
      }).run();
  })
}
