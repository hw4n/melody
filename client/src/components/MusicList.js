import { useState, useEffect } from 'react';
import { faClock, faCheck, faSync, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConditionalIcon from './ConditionalIcon';
import { useSelector } from 'react-redux';
import { requestQueueing } from '../helper/socket';
import { setSearch } from '../helper/app';
import { filterMusicArrayByKeyword, sortMusicsAsc, sortMusicsDesc, totalRuntime } from '../helper/music';
import { secondsToTimestring } from '../helper/format';

function MusicList(props) {
  const { isSearching, searchingKeyword } = useSelector(store => store.app);
  const { listTitle, customClassName, musicArray: originalMusicArray = [], message } = props;
  
  const [titleSort, setTitleSort] = useState(0);
  const [musicArray, setMusicArray] = useState([]);

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

  // set music array for displaying with original music array
  useEffect(() => {
    setMusicArray([...originalMusicArray]);
  }, [originalMusicArray]);

  // filter and set music array by search keyword
  // if not searching set it back to original
  useEffect(() => {
    if (!isSearching) {
      setMusicArray(originalMusicArray);
      return;
    }
    setMusicArray(filterMusicArrayByKeyword(musicArray, searchingKeyword));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, searchingKeyword]);

  // in what order the musicArray should be displayed?
  useEffect(() => {
    if (titleSort === 0) {
      setMusicArray(originalMusicArray);
    } else if (titleSort === 1) {
      setMusicArray(sortMusicsAsc);
    } else {
      setMusicArray(sortMusicsDesc);
    }
  }, [originalMusicArray, titleSort]);

  return (
    <>
      <div className="songListHeader divider">
      {isSearching ? (
        <>
          <h3><span className="searching">search result </span>{listTitle}</h3>
          <h3 className="searching">{musicArray.length} found</h3>
        </>
      ): (
        <>
          <h3>{listTitle}</h3>
          <h3>{totalRuntime(musicArray)}</h3>
        </>
      )}
      </div>
      <div className="columnIndicator divider">
        <div className="clickable" onClick={() => {
          setTitleSort(x => (x + 1) % 3);
        }}>title {titleSort === 0 ? "-" : titleSort === 1 ? "↑" : "↓"}</div>
        <div>artist</div>
        <div>album</div>
        <div>lyrics</div>
        <div><FontAwesomeIcon icon={faClock}/></div>
      </div>
      <div className={customClassName}>
        {musicArray.map(song => {
          return (
            <div className="song" key={song.id} id={song.id} onDoubleClick={handleDoubleClick}>
              <div className="title dotOverflow">
                <span>{song.title}</span>
              </div>
              <div className="artist dotOverflow">
                <span className="clickable" onClick={handleKeywordClick}>{song.artist}</span>
              </div>
              <div className="album dotOverflow">
                <span className="clickable" onClick={handleKeywordClick}>{song.album}</span>
              </div>
              <div className="lyricsAvailability dotOverflow">
                <ConditionalIcon condition={song.lyrics} onTrue={song.synced ? faSync : faCheck} onFalse={faTimes} />
              </div>
              <div className="duration dotOverflow">{secondsToTimestring(song.duration)}</div>
            </div>
          )
        })}
        {message ? (
          <div className="song">
            <div className="tip dotOverflow">
              {message}
            </div>
          </div>
        ) : (<></>)}
      </div>
    </>
  );
}

export default MusicList;
