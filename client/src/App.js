import logo from './logo.svg';
import './App.css';
import io from "socket.io-client";
import { useEffect, useRef, useState } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

let SOCKET_URI = "/"
if (process.env.NODE_ENV === "development") {
  SOCKET_URI = "http://localhost:3333";
}

const socket = io.connect(SOCKET_URI);

function App() {
  const [queue, setQueue] = useState([]);
  const [played, setPlayed] = useState([]);
  const [playing, setPlaying] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    socket.on('data', (msg) => {
      setQueue(msg.queue);
      setPlayed(msg.played);
      setPlaying(msg.playing);
    });
  });

  const playerRef = useRef();
  const volumeRef = useRef();

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
              <div className="song">
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
              <div className="song">
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
        <audio ref={playerRef}>
          <source src="/stream" type="audio/mpeg"/>
        </audio>
        <div className="currentMusic">
          <div className="currentTitle">{playing.title}</div>
          <div className="currentArtist dotOverflow">{playing.artist}</div>
        </div>
        <div className="controller">
          <button onClick={() => {
            if (!isPlaying) {
              playerRef.current.setAttribute("src", "/stream");
              playerRef.current.play();
              playerRef.current.volume = volumeRef.current.value;
            } else {
              playerRef.current.pause();
              playerRef.current.setAttribute('src', "");
            }
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
              playerRef.current.volume = 0;
            } else {
              playerRef.current.volume = 0.05;
            }
            setMuted(!muted);
          }}>
            {!muted ? (
              <FontAwesomeIcon icon={faVolumeDown} size="2x"/>
            ) : (
              <FontAwesomeIcon icon={faVolumeMute} size="2x"/>
            )}
          </button>
          <div id="volumeControl">
            <input type="range" min="0" max="0.2" step="0.01" defaultValue="0.05" ref={volumeRef} onChange={e => {
              playerRef.current.volume = e.target.value;
              if (playerRef.current.volume === 0) {
                setMuted(true);
              } else {
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
