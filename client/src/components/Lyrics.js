import { useState, useRef, useEffect } from 'react';
import './Lyrics.css';
import Loader from './Loader';
import LyricEditor from './LyricEditor';
import LyricsHeader from './LyricsHeader';
import LyricsBody from './LyricsBody';

function Lyrics(props) {
  const { title } = props.playing;
  const { playbackStart, lyricScroll, setLyricScroll } = props;
  const [ready, setReady] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [editing, setEditing] = useState(false);
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
  }, [title]);

  useEffect(() => {
    if (!synced && lyrics && ready) {
      lyricsRef.current.scrollTop = lyricScroll;
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
      { loaderMounted ? (
        <Loader ready={ready} unmounter={setLoaderMounted}/>
      ) : <></> }
      <LyricsHeader {... {title, editing, synced, setSynced, saveLyrics, setEditing}}/>
      { editing ? (
        <LyricEditor setEditing={setEditing} saveLyrics={saveLyrics} lyrics={lyrics} textareaRef={textareaRef}/>
      ) : (
        <LyricsBody {... { lyrics, playbackStart, synced, lyricsRef, setLyricScroll, createLyrics }}/>
      )}
    </div>
  );
}

export default Lyrics;
