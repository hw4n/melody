import React from 'react'
import { requestQueueing } from '../helper/socket';
import { handleKeywordClick, setSearch } from '../helper/app';
import { secondsToTimestring } from '../helper/format';

function Music(props) {
  const { music } = props;

  // enqueue double-clicked music with id
  function handleDoubleClick(e) {
    if (e.target.classList.contains("clickable")
    // if clicked music is not in 'queuable' array
    || !e.target.closest('.music').parentNode.classList.contains('queue')
    ) {
      return;
    }
    // apply takeout, remove it after animation
    e.target.closest('.music').classList.toggle('takeout');
    const musicId = e.target.closest('.music').id;
    // wait for animation to be completed
    setTimeout(() => {
      requestQueueing(musicId);
      e.target.closest('.music').classList.toggle('takeout');
    }, 400);
  }

  return (
    <div className="music" id={music.id} onDoubleClick={handleDoubleClick}>
      <div className="titleAndArtist">
        <div className="title">{music.title}</div>
        <div className="artist">
          <span className="clickable" onClick={handleKeywordClick}>
            {music.artist}
          </span>
        </div>
      </div>
      <div className="album">
        <span className="clickable" onClick={handleKeywordClick}>{music.album}</span>
      </div>
      <div className="duration">{secondsToTimestring(music.duration)}</div>
    </div>
  )
}

export default Music
