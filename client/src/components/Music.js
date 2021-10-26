import React from 'react'
import { faCheck, faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import ConditionalIcon from './ConditionalIcon';
import { requestQueueing } from '../helper/socket';
import { setSearch } from '../helper/app';
import { secondsToTimestring } from '../helper/format';

function Music(props) {
  const { music } = props;

  // enqueue double-clicked music with id
  function handleDoubleClick(e) {
    if (e.target.classList.contains("clickable")) {
      return;
    }
    const musicId = e.target.parentNode.id;
    requestQueueing(musicId);
  }

  // start searching with clicked value
  function handleKeywordClick(e) {
    const keyword = e.currentTarget.innerText;
    setSearch(keyword);
  }

  return (
    <div className="song" key={music.id} id={music.id} onDoubleClick={handleDoubleClick}>
      <div className="title dotOverflow">
        <span>{music.title}</span>
      </div>
      <div className="artist dotOverflow">
        <span className="clickable" onClick={handleKeywordClick}>{music.artist}</span>
      </div>
      <div className="album dotOverflow">
        <span className="clickable" onClick={handleKeywordClick}>{music.album}</span>
      </div>
      <div className="lyricsAvailability dotOverflow">
        <ConditionalIcon condition={music.lyrics} onTrue={music.synced ? faSync : faCheck} onFalse={faTimes} />
      </div>
      <div className="duration dotOverflow">{secondsToTimestring(music.duration)}</div>
    </div>
  )
}

export default Music
