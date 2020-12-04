import './App.css';
import io from "socket.io-client";
import { useEffect, useRef, useState } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faClock, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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


  useEffect(() => {
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
    socket.on('playNext', () => {
      const newQueue = [...queue];
      const newPriority = [...priority];
      const musicToPush = playing;
      if (priority.length > 0) {
        const musicToSet = newPriority.splice(0, 1)[0];
        setPlaying(musicToSet);
        setPriority(newPriority);
      } else {
        const musicToSet = newQueue.splice(0, 1)[0];
        setPlaying(musicToSet);
        setQueue(newQueue);
      }
      setPlayed([...played, musicToPush]);
      setUpdateTime(Date.now());
    });

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

    if (searching) {
      function musicHasSearchKeyword(music) {
        let { title, artist, album } = music;
        title = title.toLowerCase()
        artist = artist.toLowerCase()
        album = album.toLowerCase()
        return (title.includes(searchKeyword) || artist.includes(searchKeyword) || album.includes(searchKeyword))
      }

      const newSearchPriority = priority.slice().filter(musicHasSearchKeyword);
      const newSearchQueue = queue.slice().filter(musicHasSearchKeyword);
      const newSearchPlayed = played.slice().filter(musicHasSearchKeyword);

      setSearchPriority(newSearchPriority);
      setSearchQueue(newSearchQueue);
      setSearchPlayed(newSearchPlayed);
    }
  }, [muted, volume, isPlaying, playing, updateTime, priority, queue, played, searching, searchKeyword]);

  const audioRef = useRef();
  const volumeRef = useRef();

  function handleSongDoubleClick(e) {
    socket.emit("priority", parseInt(e.currentTarget.id));
  }

  return (
    <div className="App">
      <div className="container">
        <h3 className="songListHeader divider">now playing</h3>
        <div className="columnIndicator divider">
          <div>title</div>
          <div>artist</div>
          <div>album</div>
          <div><FontAwesomeIcon icon={faClock}/></div>
        </div>
        <div className="song playing">
          <div className="title dotOverflow">{playing.title}</div>
          <div className="artist dotOverflow">{playing.artist}</div>
          <div className="album dotOverflow">{playing.album}</div>
          <div className="duration">{playing.duration}</div>
        </div>
        <div className="search">
          <FontAwesomeIcon icon={faSearch}/>
          <input type="text" placeholder="Search for Title / Artist / Album" onInput={(e) => {
            if (e.target.value.trim().length > 0) {
              setSearching(true);
              setSearchKeyword(e.target.value.toLowerCase());
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
          <div className="searchHeader songListHeader divider">
            <h3 className=""><span className="searching">search result </span>user queued list</h3>
            <h3 className="searching">{searchPriority.length} found</h3>
          </div>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="priority">
            {searchPriority.map(song => {
              return (
                <div className="song" key={song.id} id={song.id}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
            <div className="song">
              <div className="tip dotOverflow">
                You can queue any music you want by double-clicking music!
              </div>
            </div>
          </div>
          <div className="searchHeader songListHeader divider">
            <h3 className=""><span className="searching">search result </span>next in queue</h3>
            <h3 className="searching">{searchQueue.length} found</h3>
          </div>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="queue">
            {searchQueue.map(song => {
              return (
                <div className="song" key={song.id} id={song.id} onDoubleClick={handleSongDoubleClick}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
          </div>
          <div className="searchHeader songListHeader divider">
            <h3 className=""><span className="searching">search result </span>next in queue</h3>
            <h3 className="searching">{searchPlayed.length} found</h3>
          </div>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="played">
            {searchPlayed.map(song => {
              return (
                <div className="song" key={song.id}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
          </div>
          </>
        ) : (
          <>
          <h3 className="songListHeader divider">user queued list</h3>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="priority">
            {priority.map(song => {
              return (
                <div className="song" key={song.id} id={song.id}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
            <div className="song">
              <div className="tip dotOverflow">
                You can queue any music you want by double-clicking music!
              </div>
            </div>
          </div>
          <h3 className="songListHeader divider">next in queue</h3>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="queue">
            {queue.map(song => {
              return (
                <div className="song" key={song.id} id={song.id} onDoubleClick={handleSongDoubleClick}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
          </div>
          <h3 className="songListHeader divider">already played</h3>
          <div className="columnIndicator divider">
            <div>title</div>
            <div>artist</div>
            <div>album</div>
            <div><FontAwesomeIcon icon={faClock}/></div>
          </div>
          <div className="played">
            {played.map(song => {
              return (
                <div className="song" key={song.id}>
                  <div className="title dotOverflow">{song.title}</div>
                  <div className="artist dotOverflow">{song.artist}</div>
                  <div className="album dotOverflow">{song.album}</div>
                  <div className="duration dotOverflow">{song.duration}</div>
                </div>
              )
            })}
          </div>
          </>
        )}
      </div>
      <footer>
        {isPlaying ? (
          <audio ref={audioRef} src="/stream">
            <source src="/stream" type="audio/mpeg"/>
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
