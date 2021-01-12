import './App.css';
import io from "socket.io-client";
import { useEffect, useRef, useState } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MusicList from "./components/MusicList";
import Flash from "./components/Flash";

let SOCKET_URI = "/"
if (process.env.NODE_ENV === "development") {
  SOCKET_URI = "http://localhost:3333";
}

const DEFAULT_TITLE = process.env.TITLE || "Melody";

const socket = io.connect(SOCKET_URI);

function App() {
  const [priority, setPriority] = useState([]);
  const [queue, setQueue] = useState([]);
  const [played, setPlayed] = useState([]);
  const [playing, setPlaying] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [searching, setSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchPriority, setSearchPriority] = useState([]);
  const [searchQueue, setSearchQueue] = useState([]);
  const [searchPlayed, setSearchPlayed] = useState([]);
  const [socketId, setSocketId] = useState(undefined);

  useEffect(() => {
    if (socketId === undefined) {
      setSocketId(socket.id);
    }

    socket.off('init');
    socket.on('init', (msg) => {
      setPriority(msg.priority);
      setQueue(msg.queue);
      setPlayed(msg.played);
      setPlaying(msg.playing);
      setUpdateTime(Date.now());

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
      const newQueue = [...queue];
      const newPriority = [...priority];
      const musicToPush = playing;
      if (next.FROM_QUEUE === "priority") {
        for (let i = 0; i < newPriority.length; i++) {
          const music = newPriority[i];
          if (music.id === next.id) {
            const musicToSet = newPriority.splice(0, 1)[0];
            setPlaying(musicToSet);
            setPriority(newPriority);
            break;
          }
        }
      } else {
        for (let i = 0; i < newQueue.length; i++) {
          const music = newQueue[i];
          if (music.id === next.id) {
            const musicToSet = newQueue.splice(0, 1)[0];
            setPlaying(musicToSet);
            setQueue(newQueue);
            break;
          }
        }
      }
      setPlayed([...played, musicToPush]);
      setUpdateTime(Date.now());
    });
  }, [played, playing, priority, queue, socketId]);

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
    if (isPlaying) {
      audioRef.current.play();
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
  }, [isPlaying, playing, updateTime])

  useEffect(() => {
    if (searching) {
      function stringToSearchString(string) {
        return string.replace(/\s/g, "").toLowerCase();
      }

      function musicHasSearchKeyword(music) {
        const keyword = stringToSearchString(searchKeyword);

        let { title, artist, album } = music;
        title = stringToSearchString(title);
        artist = stringToSearchString(artist);
        album = stringToSearchString(album);
        return (title.includes(keyword) || artist.includes(keyword) || album.includes(keyword))
      }

      const newSearchPriority = priority.slice().filter(musicHasSearchKeyword);
      const newSearchQueue = queue.slice().filter(musicHasSearchKeyword);
      const newSearchPlayed = played.slice().filter(musicHasSearchKeyword);

      setSearchPriority(newSearchPriority);
      setSearchQueue(newSearchQueue);
      setSearchPlayed(newSearchPlayed);
    }
  }, [played, priority, queue, searchKeyword, searching])

  const audioRef = useRef();
  const volumeRef = useRef();

  function requestQueueing(e) {
    socket.emit("priority", parseInt(e.currentTarget.id));
  }

  return (
    <div className="App">
      <Flash/>
      <div className="container">
        <MusicList
          listTitle="now playing"
          customClassName="playing"
          musicArray={[playing]}
          searchSetters={{setSearching, setSearchKeyword}}
        />
        <div className="search">
          <FontAwesomeIcon icon={faSearch}/>
          <input type="text" placeholder="Search for Title / Artist / Album" value={searchKeyword} onInput={(e) => {
            const currentValue = e.target.value;
            if (currentValue.trim() === "") {
              setSearching(false);
              setSearchKeyword("");
              return;
            }
            if (currentValue.length > 0) {
              setSearching(true);
              setSearchKeyword(currentValue);
            } else {
              setSearching(false);
              setSearchKeyword("");
            }
          }}/>
          { searchKeyword.length ? (
            <FontAwesomeIcon icon={faTimes} onClick={(e) => {
              e.currentTarget.parentNode.querySelector("input").value = "";
              setSearching(false);
              setSearchKeyword("");
            }}/>
          ) : (
            <></>
          )}
        </div>
        { searching ? (
          <>
            <MusicList
              searching={true}
              listTitle="user queued list"
              customClassName="priority"
              musicArray={searchPriority}
              message="You can queue any music you want by double-clicking music!"
              searchSetters={{setSearching, setSearchKeyword}}
            />
            <MusicList
              searching={true}
              listTitle="next in queue"
              customClassName="queue"
              musicArray={searchQueue}
              handleDoubleClick={requestQueueing}
              searchSetters={{setSearching, setSearchKeyword}}
            />
            <MusicList
              searching={true}
              listTitle="already played"
              customClassName="played"
              musicArray={searchPlayed}
              searchSetters={{setSearching, setSearchKeyword}}
            />
          </>
        ) : (
          <>
            <MusicList
              listTitle="user queued list"
              customClassName="priority"
              musicArray={priority}
              message="You can queue any music you want by double-clicking music!"
              searchSetters={{setSearching, setSearchKeyword}}
            />
            <MusicList
              listTitle="next in queue"
              customClassName="queue"
              musicArray={queue}
              handleDoubleClick={requestQueueing}
              searchSetters={{setSearching, setSearchKeyword}}
            />
            <MusicList
              listTitle="already played"
              customClassName="played"
              musicArray={played}
              searchSetters={{setSearching, setSearchKeyword}}
            />
          </>
        )}
      </div>
      <footer>
        {isPlaying ? (
          <audio ref={audioRef} src={`/stream?id=${socketId}`}>
            <source src={`/stream?id=${socketId}`} type="audio/mpeg"/>
          </audio>
        ) : (
          <audio ref={audioRef} src="" preload="none"/>
        )}
        <div className="currentMusic">
          {playing ? (
            <>
              <img className="coverArt" src={`/96.png?${updateTime}`} alt="album cover artwork"/>
              <div className="currentMusicText">
                <div className="currentTitle dotOverflow">{playing.title}</div>
                <div className="currentArtist dotOverflow">{playing.artist}</div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="controller">
          <button onClick={() => {
            setIsPlaying(!isPlaying);
          }}>
            {!isPlaying ? (
              <FontAwesomeIcon icon={faPlayCircle} size="2x"/>
            ) : (
              <FontAwesomeIcon icon={faStopCircle} size="2x"/>
            )}
          </button>
        </div>
        <div className="volumeControlWrap">
          <button onClick={() => {
            if (!muted) {
              setMuted(true);
            } else {
              setMuted(false);
            }
          }}>
            {volume > 0 ? (
              <FontAwesomeIcon icon={faVolumeDown} size="2x"/>
            ) : (
              <FontAwesomeIcon icon={faVolumeMute} size="2x"/>
            )}
          </button>
          <div id="volumeControl">
            <input type="range" min="0" max="1" step="0.01" defaultValue="0.5" ref={volumeRef} onChange={e => {
              setVolume(e.target.value);
              if (e.target.value > 0) {
                setMuted(false);
              }
            }}/>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
