import './App.css';
import io from "socket.io-client";
import { useEffect, useRef, useState } from 'react';
import Loader from "./components/Loader";
import Flash from "./components/Flash";
import Lyrics from "./components/Lyrics";
import EntirePlaylist from "./components/EntirePlaylist";
import Footer from "./components/Footer";

let SOCKET_URI = "/"
if (process.env.NODE_ENV === "development") {
  SOCKET_URI = "http://localhost:3333";
}

const DEFAULT_TITLE = process.env.TITLE || "Melody";

const socket = io.connect(SOCKET_URI);

function App() {
  const [priority, setPriority] = useState([]);
  const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [searching, setSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPriority, setSearchPriority] = useState([]);
  const [searchQueue, setSearchQueue] = useState([]);
  const [socketId, setSocketId] = useState(undefined);
  const [playbackStart, setPlaybackStart] = useState();
  const [totalUsers, setTotalUsers] = useState(1);
  const [lyricMode, setLyricMode] = useState(false);

  useEffect(() => {
    if (socketId === undefined) {
      setSocketId(socket.id);
    }

    socket.off('init');
    socket.on('init', (msg) => {
      setPriority(msg.priority);
      setQueue(msg.queue);
      setPlaying(msg.playing);
      setUpdateTime(Date.now());
      setPlaybackStart(msg.start);
      setTotalUsers(msg.total_users);

      document.addEventListener("keydown", (e) => {
        if (e.target.type === "text") {
          return
        }

        if (e.key === " ") {
          e.preventDefault();
          setIsPlaying(isPlaying => !isPlaying);
        } else if (e.key === "m" || e.key === "M") {
          setMuted(muted => !muted);
        }
      });
    });

    socket.off('priority');
    socket.on('priority', musicId => {
      const newQueue = [...queue];
      const newPriority = [...priority];
      for (let i = 0; i < newQueue.length; i++) {
        const music = newQueue[i];
        if (music.id === musicId) {
          const musicToPush = newQueue.splice(i, 1)[0];
          newPriority.push(musicToPush);
          setQueue(newQueue);
          setPriority(newPriority);
          break;
        }
      }
    });

    socket.off('playNext');
    socket.on('playNext', (next) => {
      const newQueue = [...queue, playing];
      const newPriority = [...priority];
      if (next.FROM_QUEUE === "priority") {
        for (let i = 0; i < newPriority.length; i++) {
          const music = newPriority[i];
          if (music.id === next.id) {
            const musicToSet = newPriority.splice(i, 1)[0];
            setPlaying(musicToSet);
            setPriority(newPriority);
            break;
          }
        }
      } else {
        for (let i = 0; i < newQueue.length; i++) {
          const music = newQueue[i];
          if (music.id === next.id) {
            const musicToSet = newQueue.splice(i, 1)[0];
            setPlaying(musicToSet);
            setQueue(newQueue);
            break;
          }
        }
      }
      setQueue(newQueue);
      setUpdateTime(Date.now());
      setPlaybackStart(next.start);
    });

    socket.off('total_users');
    socket.on('total_users', (total_users) => {
      setTotalUsers(total_users);
    });
  }, [playing, priority, queue, socketId]);

  useEffect(() => {
    if (muted && volume > 0) {
      setVolume(-volume);
      volumeRef.current.value = 0;
    } else if (!muted && volume < 0) {
      volumeRef.current.value = -volume;
      setVolume(-volume);
    }

    if (volume <= 0) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  }, [muted, volume])

  useEffect(() => {
    function playMusic() {
      const AppleDevice = /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent);
      if (AppleDevice) {
        audioRef.current.load();
        audioRef.current.pause();
      }
      let playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current.currentTime = (new Date() - new Date(playbackStart)) / 1000;
        }).catch((e) => {});
      }
    }

    if (isPlaying) {
      let currentTime = (new Date() - new Date(playbackStart)) / 1000;
      if (currentTime < 0) {
        setTimeout(() => {
          playMusic();
        }, (new Date() - new Date(playbackStart)) * -1);
      } else {
        playMusic();
      }
      document.title = `♪ Playing ${playing.title}`;
    } else {
      document.title = DEFAULT_TITLE;
    }

    if ('mediaSession' in navigator) {
      const { title, artist, album } = playing

      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: [
          { src: `/96.png?${updateTime}`,  sizes: '96x96',   type: 'image/png' },
          { src: `/128.png?${updateTime}`, sizes: '128x128', type: 'image/png' },
          { src: `/192.png?${updateTime}`, sizes: '192x192', type: 'image/png' },
          { src: `/256.png?${updateTime}`, sizes: '256x256', type: 'image/png' },
          { src: `/384.png?${updateTime}`, sizes: '384x384', type: 'image/png' },
          { src: `/512.png?${updateTime}`, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setPositionState({
        duration: 0,
        playbackRate: audioRef.current.playbackRate,
        position: 0
      });

      const actionHandlers = [
        ['play',          () => {
          setIsPlaying(true);
          navigator.mediaSession.playbackState = "playing";
        }],
        ['pause',         () => {
          setIsPlaying(false);
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
  }, [isPlaying, playbackStart, playing, updateTime])

  useEffect(() => {
    if (searching) {
      function stringToSearchString(string) {
        return string.replace(/\s/g, "").toLowerCase();
      }

      function musicHasSearchKeyword(music) {
        const keyword = stringToSearchString(searchKeyword);
        let { title, artist, album, romaji } = music;
        let { title: titleRomaji, artist: artistRomaji } = romaji;
        title = stringToSearchString(title);
        artist = stringToSearchString(artist);
        album = stringToSearchString(album);
        titleRomaji = stringToSearchString(titleRomaji);
        artistRomaji = stringToSearchString(artistRomaji);
        return (
          title.includes(keyword)
          || artist.includes(keyword)
          || album.includes(keyword)
          || titleRomaji.includes(keyword)
          || artistRomaji.includes(keyword)
        );
      }

      const newSearchPriority = priority.slice().filter(musicHasSearchKeyword);
      const newSearchQueue = queue.slice().filter(musicHasSearchKeyword);

      setSearchPriority(newSearchPriority);
      setSearchQueue(newSearchQueue);
    }
  }, [priority, queue, searchKeyword, searching])

  const audioRef = useRef();
  const volumeRef = useRef();

  function requestQueueing(e) {
    socket.emit("priority", e.currentTarget.id);
  }

  return (
    <div className="App">
      { queue.length ? (
        <></>
      ) : (
        <Loader/>
      )}
      <Flash/>
      { lyricMode ? (
        <Lyrics playing={playing}/>
      ) : (
        <></>
      )}
      <div className="container">
        <EntirePlaylist
          playing={playing}
          priority={priority}
          queue={queue}
          searching={searching}
          setSearching={setSearching}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          searchPriority={searchPriority}
          searchQueue={searchQueue}
          requestQueueing={requestQueueing}
        />
      </div>
      <Footer
        playing={playing}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        lyricMode={lyricMode}
        setLyricMode={setLyricMode}
        muted={muted}
        setMuted={setMuted}
        volume={volume}
        setVolume={setVolume}
        audioRef={audioRef}
        volumeRef={volumeRef}
        updateTime={updateTime}
        playbackStart={playbackStart}
        totalUsers={totalUsers}
      />
    </div>
  );
}

export default App;
