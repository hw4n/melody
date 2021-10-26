import './App.css';
import { useEffect, useState } from 'react';
import Loader from "./components/Loader";
import Flash from "./components/Flash";
import Lyrics from "./components/Lyrics";
import EntirePlaylist from "./components/EntirePlaylist";
import Footer from "./components/Footer";
import { useDispatch, useSelector } from 'react-redux';

const DEFAULT_TITLE = process.env.TITLE || "Melody";

function App() {
  const dispatch = useDispatch();
  const [loaderMounted, setLoaderMounted] = useState(true);
  const { playing, queue, start } = useSelector(store => store.socket);
  const { isPlaying, isLyricMode } = useSelector(store => store.app);

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      // ignore keydown from inputs
      if (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA") {
        return;
      }
      switch (e.key) {
        case " ":
          dispatch({type: "APP/TOGGLE_PLAYING"});
          break;
        case "m":
        case "M":
          dispatch({type: "APP/TOGGLE_MUTED"});
          break;
        case "l":
        case "L":
          dispatch({type: "APP/TOGGLE_LYRIC_MODE"});
          break;
        case "Escape":
          dispatch({type: "APP/SET_LYRIC_MODE", setTo: false});
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      const { title, artist, album } = playing

      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: [
          { src: `/96.png?${start}`,  sizes: '96x96',   type: 'image/png' },
          { src: `/128.png?${start}`, sizes: '128x128', type: 'image/png' },
          { src: `/192.png?${start}`, sizes: '192x192', type: 'image/png' },
          { src: `/256.png?${start}`, sizes: '256x256', type: 'image/png' },
          { src: `/384.png?${start}`, sizes: '384x384', type: 'image/png' },
          { src: `/512.png?${start}`, sizes: '512x512', type: 'image/png' },
        ]
      });

      const actionHandlers = [
        ['play',          () => {
          dispatch({type: "APP/TOGGLE_PLAYING"});
          navigator.mediaSession.playbackState = "playing";
        }],
        ['pause',         () => {
          dispatch({type: "APP/TOGGLE_PLAYING"});
          navigator.mediaSession.playbackState = "paused";
        }],
        ['previoustrack', () => { /* ... */ }],
        ['nexttrack',     () => { /* ... */ }]
      ];

      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }, [start]);

  useEffect(() => {
    if (isPlaying) {
      document.title = `♪ Playing ${playing.title}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [isPlaying, playing.title]);

  return (
    <div className="App">
      { loaderMounted ? (
        <Loader ready={queue.length ? true : playing} unmounter={setLoaderMounted}/>
      ) : <></> }
      <Flash/>
      { isLyricMode ? <Lyrics/> : <></> }
      <div className="container">
        <EntirePlaylist/>
      </div>
      <Footer/>
    </div>
  );
}

export default App;
