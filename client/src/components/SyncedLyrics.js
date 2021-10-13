import { useState, useRef, useEffect } from 'react';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Lyrics.css';
import Loader from './Loader';

function SyncedLyrics(props) {
  const { title } = props.playing;
  const { playbackStart } = props;
  const [loading, setLoading] = useState(true);
  const [lyrics, setLyrics] = useState("");
  const [editing, setEditing] = useState(false);

  const [lyricTimeout, setLyricTimeout] = useState([]);
  const [lyricBlock, setLyricBlock] = useState("");

  const textareaRef = useRef();

  useEffect(() => {
    setLyrics('');
    fetch('/lyrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.lyrics) {
          setLyrics(() => data.lyrics);
        }
        setLoading(false);
      });
  }, [title]);

  function handleLyricsKeydown(e) {
    if (e.target.tagName === "TEXTAREA") {
      return;
    }
    switch (e.key) {
      case "e":
      case "E":
        e.preventDefault();
        setEditing(true);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleLyricsKeydown);
    return () => {
      document.removeEventListener("keydown", handleLyricsKeydown);
    }
  });

  function saveLyrics() {
    const newLyrics = textareaRef.current.value;
    fetch("/lyrics", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lyrics: newLyrics,
      }),
    }).then(() => {
      setLyrics(newLyrics);
      setEditing(false);
    });
  }

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
    const timeout = findLyric();
    lyricTimeout.push(timeout);
    return () => {
      for (const timeout of lyricTimeout) {
        clearTimeout(timeout);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics, playbackStart]);

  return (
    <div class="lyricsWrap">
      { loading ? (
        <Loader transparent={true}/>
      ) : (
        <>
        <div class="lyricsHeaderWrap">
          <div class="lyricsHeaderLeft"></div>
          <div class="lyricsHeaderMiddle">{title}</div>
          <div class="lyricsHeaderRight">
            { editing ? (
              <button onClick={() => {
                saveLyrics();
                setEditing(false);
              }} class="in-progress">
                <FontAwesomeIcon icon={faSave} size="2x"/>
                <span>Save lyrics</span>
              </button>
            ) : (
              <button onClick={() => {
                setEditing(!editing);
              }}>
                <FontAwesomeIcon icon={faEdit} size="2x"/>
                <span>Edit lyrics</span>
              </button>
            )}
          </div>
        </div>
        { editing ? (
          <textarea class="lyricsEditor" onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              e.target.value += "\t";
            }
            if (e.key === "Escape") {
              setEditing(false);
            }
            if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
              e.preventDefault();
              saveLyrics();
              setEditing(false);
            }
          }} defaultValue={lyrics} ref={textareaRef} autoFocus/>
        ) : (
          <div className="lyricsDisplay">
            {lyricBlock.split("\n").map(x => {
              return <div className="focused lyrics">{x}</div>
            })}
          </div>
        )}
        </>
      )}
    </div>
  );
}

export default SyncedLyrics
