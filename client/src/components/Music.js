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
    const musicId = e.target.closest('.music').id;
    requestQueueing(musicId);
  }

  // start searching with clicked value
  function handleKeywordClick(e) {
    const keyword = e.currentTarget.innerText;
    setSearch(keyword);
  }

  return (
    <div className="music" key={music.id} id={music.id} onDoubleClick={handleDoubleClick}>
      <div className="titleAndArtist">
        <div className="title">{music.title}</div>
        <div className="artist">{music.artist}</div>
      </div>
      <div className="album">
        <span className="clickable" onClick={handleKeywordClick}>{music.album}</span>
      </div>
      <div className="duration">{secondsToTimestring(music.duration)}</div>
    </div>
  )
}

export default Music
