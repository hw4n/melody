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
    volume,
    setVolume,
    audioRef,
    volumeRef,
    updateTime,
    playbackStart,
    totalUsers
  } = props;

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
              if (e.target.value > 0) {
                setMuted(false);
              }
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
