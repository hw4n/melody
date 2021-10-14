import { useState, useRef, useEffect } from 'react';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Lyrics.css';
import Loader from './Loader';
import LyricEditor from './LyricEditor';

function Lyrics(props) {
  const { title } = props.playing;
  const { lyricScroll, setLyricScroll } = props;
  const [loading, setLoading] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [editing, setEditing] = useState(false);
  const [synced, setSynced] = useState(false);

  const lyricsRef = useRef();
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

  useEffect(() => {
    if (lyrics && !loading) {
      lyricsRef.current.scrollTop = lyricScroll;
    }
  // intentional, lyricScroll should not invoke this hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, lyrics]);

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

  function createLyrics(string) {
    if (string.length) {
      return string
        .replace(/\[\d+\]/g, "")
        .replace(/ +href=\S+"/g, "")
        .replace(/font-family:/g, "")
        .replace(/font-size:/g, "")
        .replace(/<del>.+<\/del>/g, "");
    }
    return "No lyrics yet, add the lyrics!";
  }

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
        synced: synced,
      }),
    }).then(() => {
      setLyrics(newLyrics);
      setEditing(false);
    });
  }

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
              <>
                <button onClick={() => {
                  setSynced(!synced);
                }} class="in-progress">
                  { synced ? (
                    <FontAwesomeIcon icon={faCheckSquare} size="2x"/>
                  ) : (
                    <FontAwesomeIcon icon={faSquare} size="2x"/>
                  )}
                  <span>Synced Lyric</span>
                </button>
                <button onClick={() => {
                  saveLyrics();
                  setEditing(false);
                }} class="in-progress">
                  <FontAwesomeIcon icon={faSave} size="2x"/>
                  <span>Save lyrics</span>
                </button>
              </>
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
          <LyricEditor setEditing={setEditing} saveLyrics={saveLyrics} lyrics={lyrics} textareaRef={textareaRef}/>
        ) : (
          <div
            class="lyrics"
            ref={lyricsRef}
            onScroll={(e) => {
              setLyricScroll(e.target.scrollTop);
            }}
            dangerouslySetInnerHTML={{__html: createLyrics(lyrics)}}
          />
        )}
        </>
      )}
    </div>
  );
}

export default Lyrics;
