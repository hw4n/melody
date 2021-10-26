import { useEffect, useState, useRef } from 'react';
import { faPlayCircle, faStopCircle, faVolumeDown, faVolumeMute, faFileAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import ProgressBar from "./ProgressBar";
import { isMobileDevice } from "../helper/check";
import store from '../redux/store';

function Footer() {
  const {
    playing,
    start,
    total_users: totalUsers
  } = useSelector(store => store.socket);
  const {
    isPlaying,
    isLyricMode,
    isMuted
  } = useSelector(store => store.app);

  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef();
  const volumeRef = useRef();

  useEffect(() => {
    if (isMuted && volume > 0) {
      setVolume(-volume);
      volumeRef.current.value = 0;
    } else if (!isMuted && volume < 0) {
      volumeRef.current.value = -volume;
      setVolume(-volume);
    }
  }, [isMuted, volume]);

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
        audioRef.current.currentTime = (new Date() - new Date(start)) / 1000;
      }).catch((e) => {
        console.log(e);
      });
    }

    if (isPlaying && audioRef.current.paused) {
      let currentTime = (new Date() - new Date(start)) / 1000;
      if (currentTime < 0) {
        setTimeout(() => {
          playMusic();
        }, (new Date() - new Date(start)) * -1);
      } else {
        playMusic();
      }
    }
  }, [isPlaying, start]);

  return (
    <footer>
      {isPlaying ? (
        <audio ref={audioRef} src={`/stream?${start}`}>
          <source src={`/stream?${start}`} type="audio/mpeg"/>
        </audio>
      ) : (
        <audio ref={audioRef} src="" preload="none"/>
      )}
      <ProgressBar
        duration={playing.duration}
        playbackStart={start}
        displayTime={false}
        noRadius={true}
        updateMS={250}
      />
      <div className="footerContainer">
        <div className="currentMusic">
          {playing ? (
            <>
              <img className="coverArt" src={`/96.png?${start}`} alt="album cover artwork"/>
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
          {/* play button */}
          <button onClick={() => {
            store.dispatch({type: "APP/TOGGLE_PLAYING", isPlaying: !isPlaying});
          }}>
            {!isPlaying ? (
              <FontAwesomeIcon icon={faPlayCircle} size="2x"/>
            ) : (
              <FontAwesomeIcon icon={faStopCircle} size="2x"/>
            )}
          </button>
          {/* lyric button */}
          <button onClick={() => {
            store.dispatch({type: "APP/TOGGLE_LYRIC_MODE", isLyricMode: !isLyricMode});
            }} class={isLyricMode ? "active" : ""}>
            <FontAwesomeIcon icon={faFileAlt} size="2x"/>
          </button>
          {/* mute button and volume range input */}
          <div className="volumeControlWrap" style={{display: isMobileDevice() ? "none" : ""}}>
            <button onClick={() => {
              store.dispatch({type: "APP/TOGGLE_MUTED", isMuted: !isMuted});
            }} class={isMuted ? "disabled" : ""}>
              {volume > 0 ? (
                <FontAwesomeIcon icon={faVolumeDown} size="2x"/>
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} size="2x"/>
              )}
            </button>
            <div id="volumeControl">
              <input type="range" min="0" max="1" step="0.01" defaultValue="0.5" ref={volumeRef} onChange={e => {
                setVolume(e.target.value);
                if (e.target.value <= 0) {
                  store.dispatch({type: "APP/TOGGLE_MUTED", isMuted: true});
                } else if (isMuted) {
                  store.dispatch({type: "APP/TOGGLE_MUTED", isMuted: false});
                }
              }}/>
            </div>
          </div>
          <div class="totalUsersWrap">
            <FontAwesomeIcon icon={faUsers}/>
            <div class="total_users">{totalUsers}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
