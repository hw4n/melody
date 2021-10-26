import { useState, useRef, useEffect } from 'react';
import './Lyrics.css';
import Loader from './Loader';
import LyricEditor from './LyricEditor';
import LyricsHeader from './LyricsHeader';
import LyricsBody from './LyricsBody';
import { useDispatch, useSelector } from 'react-redux';

function Lyrics() {
  const dispatch = useDispatch();
  const { start } = useSelector(store => store.socket);
  const { lyricScrollPosition, isEditingLyric } = useSelector(store => store.app);

  const [ready, setReady] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [synced, setSynced] = useState(false);

  const lyricsRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    setLyrics('');
    setReady(false);
    setLoaderMounted(true);
    fetch('/lyrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.lyrics) {
          setLyrics(() => data.lyrics);
        }
        setSynced(data.synced);
        setReady(true);
      });
  }, [start]);

  useEffect(() => {
    if (lyricsRef.current && !synced && lyrics && ready) {
      lyricsRef.current.scrollTop = lyricScrollPosition;
    }
  // intentional, lyricScroll should not invoke this hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lyrics]);

  function handleLyricsKeydown(e) {
    if (e.target.tagName === "TEXTAREA") {
      return;
    }
    switch (e.key) {
      case "e":
      case "E":
        e.preventDefault();
        dispatch({type: "APP/SET_LYRIC_EDITING", setTo: true});
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
      dispatch({type: "APP/SET_LYRIC_EDITING", setTo: false});
    });
  }

  return (
    <div class="lyricsWrap">
      { loaderMounted ? (
        <Loader ready={ready} unmounter={setLoaderMounted}/>
      ) : <></> }
      <LyricsHeader {... {synced, setSynced, saveLyrics}}/>
      { isEditingLyric ? (
        <LyricEditor saveLyrics={saveLyrics} lyrics={lyrics} textareaRef={textareaRef}/>
      ) : (
        <LyricsBody {... { lyrics, start, synced, lyricsRef, createLyrics }}/>
      )}
    </div>
  );
}

export default Lyrics;
