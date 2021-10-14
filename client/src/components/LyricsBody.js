import React, { useState, useEffect } from 'react'

function LyricsBody(props) {
  const { lyrics, playbackStart, synced, lyricsRef, setLyricScroll, createLyrics } = props;

  const [lyricTimeout, setLyricTimeout] = useState([]);
  const [lyricBlock, setLyricBlock] = useState("");

  function hmsToSecond(hms) {
    let seconds = 0
    const [h, m, s] = hms.split(":");
    seconds += h ? Number(h) * 3600 : 0;
    seconds += m ? Number(m) * 60 : 0;
    seconds += s ? Number(s) : 0;
    return seconds;
  }

  const lyricsArray = lyrics.split("\n");

  function findLyric(delay = 0) {
    let block = '';

    return setTimeout(() => {
      while (lyricsArray) {
        const line = lyricsArray.shift();
  
        if (line === undefined) break;
        if (line === "") continue;
  
        if (/\[\d*:\d*:\d+\.{0,1}\d*]/.exec(line)) {
          const lyricTime = hmsToSecond(line.slice(1, line.length-1));
          let secondsPosition = (new Date() - playbackStart) / 1000;
          if (lyricTime > secondsPosition) {
            setLyricBlock(block);
            lyricTimeout.push(findLyric(lyricTime - secondsPosition));
            setLyricTimeout(lyricTimeout);
            break;
          } else {
            block = "";
          }
        } else {
          block += line + "\n";
        }
      }
    }, delay * 1000);
  }

  useEffect(() => {
    if (synced) {
      const timeout = findLyric();
      lyricTimeout.push(timeout); 
    }
    return () => {
      for (const timeout of lyricTimeout) {
        clearTimeout(timeout);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synced, lyrics, playbackStart]);

  return (
    synced ? (
      <div className="lyricsDisplay">
        {lyricBlock.split("\n").map(x => {
          return <div className="focused lyrics">{x}</div>
        })}
      </div>
    ) : (
      <div
        class="lyrics"
        ref={lyricsRef}
        onScroll={(e) => {
          setLyricScroll(e.target.scrollTop);
        }}
        dangerouslySetInnerHTML={{__html: createLyrics(lyrics)}}
      />
    )
  )
}

export default LyricsBody
