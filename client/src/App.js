import logo from './logo.svg';
import './App.css';
import io from "socket.io-client";
import { useEffect, useRef, useState } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const actionHandlers = [
  ['pause',         () => { /* ... */ }],
  ['previoustrack', () => { /* ... */ }],
  ['nexttrack',     () => { /* ... */ }]
];

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

  useEffect(() => {
    socket.on('data', (msg) => {
      setPriority(msg.priority);
      setQueue(msg.queue);
      setPlayed(msg.played);
      setPlaying(msg.playing);
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

      if ("mediaSession" in navigator) {
        const { title, artist, album } = playing
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: title,
          artist: artist,
          album: album,
          artwork: [
            { src: `data:image/png;base64,${playing.cover}`, sizes: '96x96', type: 'image/png' },
            { src: `data:image/png;base64,${playing.cover}`, sizes: '128x128', type: 'image/png' },
            { src: `data:image/png;base64,${playing.cover}`, sizes: '192x192', type: 'image/png' },
            { src: `data:image/png;base64,${playing.cover}`, sizes: '256x256', type: 'image/png' },
            { src: `data:image/png;base64,${playing.cover}`, sizes: '384x384', type: 'image/png' },
            { src: `data:image/png;base64,${playing.cover}`, sizes: '512x512', type: 'image/png' },
          ]
        });

        for (const [action, handler] of actionHandlers) {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch (error) {
            console.log(error);
          }
        }
      }
    } else {
      document.title = DEFAULT_TITLE;
    }
  }, [muted, volume, isPlaying, playing]);

  const audioRef = useRef();
  const volumeRef = useRef();

  function handleSongDoubleClick(e) {
    socket.emit("queue", parseInt(e.currentTarget.id));
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
          {playing.cover ? (
            <>
              <img class="coverArt" src={`data:image/png;base64, ${playing.cover}`} alt="album cover artwork"/>
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
