import { useEffect, useState, useRef } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faFileAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProgressBar from "./ProgressBar";

function Footer(props) {
  const {
    playing,
    isPlaying,
    setIsPlaying,
    lyricMode,
    setLyricMode,
    muted,
    setMuted,
    updateTime,
    playbackStart,
    totalUsers
  } = props;

  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef();
  const volumeRef = useRef();

  useEffect(() => {
    if (muted && volume > 0) {
      setVolume(-volume);
      volumeRef.current.value = 0;
    } else if (!muted && volume < 0) {
      volumeRef.current.value = -volume;
      setVolume(-volume);
    }
  }, [muted, volume]);

  useEffect(() => {
    if (volume <= 0) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    function playMusic() {
      audioRef.current.play().then(() => {
        audioRef.current.currentTime = (new Date() - new Date(playbackStart)) / 1000;
      }).catch((e) => {
        console.log(e);
      });
    }

    if (isPlaying && audioRef.current.paused) {
      let currentTime = (new Date() - new Date(playbackStart)) / 1000;
      if (currentTime < 0) {
        setTimeout(() => {
          playMusic();
        }, (new Date() - new Date(playbackStart)) * -1);
      } else {
        playMusic();
      }
    }
  }, [isPlaying, playbackStart]);

  return (
    <footer>
      {isPlaying ? (
        <audio ref={audioRef} src={`/stream?${updateTime}`}>
          <source src={`/stream?${updateTime}`} type="audio/mpeg"/>
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
        <div className="playButtonWrap">
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
        <ProgressBar duration={playing.duration} playbackStart={playbackStart}/>
      </div>
      <div class="controlPanelRight">
        <div className="volumeControlWrap">
          <button onClick={() => {
            setLyricMode(!lyricMode);
          }} class={lyricMode ? "active" : ""}>
            <FontAwesomeIcon icon={faFileAlt} size="2x"/>
          </button>
          <button onClick={() => {
            setMuted(!muted);
          }} class={muted ? "disabled" : ""}>
            {volume > 0 ? (
              <FontAwesomeIcon icon={faVolumeDown} size="2x"/>
            ) : (
              <FontAwesomeIcon icon={faVolumeMute} size="2x"/>
            )}
          </button>
          <div id="volumeControl">
            <input type="range" min="0" max="1" step="0.01" defaultValue="0.5" ref={volumeRef} onChange={e => {
              setVolume(e.target.value);
              setMuted(e.target.value <= 0)
            }}/>
          </div>
        </div>
        <div class="totalUsersWrap">
          <FontAwesomeIcon icon={faUsers}/>
          <div class="total_users">{totalUsers}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
