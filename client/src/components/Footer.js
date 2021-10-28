import { useEffect, useState, useRef } from 'react';
import { faPlay, faPause, faVolumeDown, faVolumeMute, faMicrophone, faUsers, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from 'react-redux';
import ProgressBar from "./ProgressBar";
import { isMobileDevice } from "../helper/check";

function Footer() {
  const dispatch = useDispatch();

  const {
    playing,
    start,
    total_users: totalUsers
  } = useSelector(store => store.socket);
  const {
    isPlaying,
    isLyricMode,
    isMuted,
    volume,
    isSettingMode,
  } = useSelector(store => store.app);

  const audioRef = useRef();
  const volumeRef = useRef();

  useEffect(() => {
    if (isMuted && volume > 0) {
      dispatch({type: "APP/SET_VOLUME", volume: -volume});
      volumeRef.current.value = 0;
    } else if (!isMuted && volume < 0) {
      volumeRef.current.value = -volume;
      dispatch({type: "APP/SET_VOLUME", volume: -volume});
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
        <audio ref={audioRef} src={`/api/stream?${start}`}>
          <source src={`/api/stream?${start}`} type="audio/mpeg"/>
        </audio>
      ) : (
        <audio ref={audioRef} src="" preload="none"/>
      )}
      <ProgressBar displayTime={false} noRadius={true} updateMS={250}/>
      <div className="footerContainer">
        <div className="currentMusic">
          {playing ? (
            <>
              <img className="coverArt" src={`/96.png?${start}`} alt="album cover artwork"/>
              <div className="currentMusicText">
                <div className="currentTitle">{playing.title}</div>
                <div className="currentArtist">{playing.artist}</div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="controller">
          {/* play button */}
          <button onClick={() => {
            dispatch({type: "APP/TOGGLE_PLAYING", isPlaying: !isPlaying});
          }}>
            {!isPlaying ? (
              <FontAwesomeIcon icon={faPlay} size="lg"/>
            ) : (
              <FontAwesomeIcon icon={faPause} size="lg"/>
            )}
          </button>
          {/* lyric button */}
          <button onClick={() => {
            dispatch({type: "APP/TOGGLE_LYRIC_MODE", isLyricMode: !isLyricMode});
            }} class={isLyricMode ? "active" : ""}>
            <FontAwesomeIcon icon={faMicrophone} size="lg"/>
          </button>
          {/* mute button and volume range input */}
          <div className="volumeControlWrap" style={{display: isMobileDevice() ? "none" : ""}}>
            <button onClick={() => {
              dispatch({type: "APP/TOGGLE_MUTED", isMuted: !isMuted});
            }} class={isMuted ? "disabled" : ""}>
              {volume > 0 ? (
                <FontAwesomeIcon icon={faVolumeDown} size="lg"/>
              ) : (
                <FontAwesomeIcon icon={faVolumeMute} size="lg"/>
              )}
            </button>
            <div id="volumeControl">
              <input type="range" min="0" max="1" step="0.01" defaultValue={volume} ref={volumeRef} onChange={e => {
                const newVolume = Number(e.target.value);
                dispatch({type: "APP/SET_VOLUME", volume: newVolume});
                if (e.target.value <= 0) {
                  dispatch({type: "APP/TOGGLE_MUTED", isMuted: true});
                } else if (isMuted) {
                  dispatch({type: "APP/TOGGLE_MUTED", isMuted: false});
                }
              }}/>
            </div>
          </div>
          <div class="totalUsersWrap">
            <FontAwesomeIcon icon={faUsers}/>
            <div class="total_users">{totalUsers}</div>
          </div>
          <button onClick={() => {
            dispatch({type: "APP/SET_LYRIC_MODE", setTo: false});
            dispatch({type: "APP/TOGGLE_SETTING_MODE"});
          }} className={isSettingMode ? "active" : ""}>
            <FontAwesomeIcon icon={faCog} size="lg"/>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
