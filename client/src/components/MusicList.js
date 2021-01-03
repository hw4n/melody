import { useState, useEffect } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function MusicList(props) {
  const { searching, listTitle, customClassName, musicArray: originalMusicArray, message, handleDoubleClick: parentHandleDoubleClick, searchSetters } = props;
  const [titleSort, setTitleSort] = useState(0);
  const [originalOrder, setOriginalOrder] = useState();
  const [musicArray, setMusicArray] = useState([]);

  function handleDoubleClick(e) {
    if (e.target.classList.contains("clickable")) {
      return;
    }

    if (parentHandleDoubleClick !== undefined) {
      parentHandleDoubleClick(e);
    }
  }

  function handleKeywordClick(e) {
    searchSetters.setSearching(true);
    searchSetters.setSearchKeyword(e.currentTarget.innerText);
  }

  function sortMusicsToOriginal(array) {
    return array.slice().sort((a, b) => originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id));
  }

  function sortMusicsAsc(array) {
    return array.slice().sort((a, b) => a.title[0].charCodeAt() - b.title[0].charCodeAt());
  }

  function sortMusicsDesc(array) {
    return array.slice().sort((a, b) => b.title[0].charCodeAt() - a.title[0].charCodeAt());
  }

  useEffect(() => {
    setOriginalOrder(originalMusicArray.map(music => music.id));
    setMusicArray(originalMusicArray.slice());
  }, [originalMusicArray]);

  useEffect(() => {
    if (titleSort === 0) {
      setMusicArray(musicArray => sortMusicsToOriginal(musicArray));
    }
    else if (titleSort === 1) {
      setMusicArray(musicArray => sortMusicsAsc(musicArray));
    } else {
      setMusicArray(musicArray => sortMusicsDesc(musicArray));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalOrder, titleSort]);

  return (
    <>
      {searching ? (
        <div className="searchHeader songListHeader divider">
          <h3 className=""><span className="searching">search result </span>{listTitle}</h3>
          <h3 className="searching">{musicArray.length} found</h3>
        </div>
      ): (
        <h3 className="songListHeader divider">{listTitle}</h3>
      )}
      <div className="columnIndicator divider">
        <div className="clickable" onClick={() => {
          setTitleSort(x => (x + 1) % 3);
        }}>title {titleSort === 0 ? "-" : titleSort === 1 ? "↑" : "↓"}</div>
        <div>artist</div>
        <div>album</div>
        <div><FontAwesomeIcon icon={faClock}/></div>
      </div>
      <div className={customClassName}>
        {musicArray.map(song => {
          return (
            <div className="song" key={song.id} id={song.id} onDoubleClick={handleDoubleClick}>
              <div className="title dotOverflow">
                <span className="clickable" onClick={handleKeywordClick}>{song.title}</span>
              </div>
              <div className="artist dotOverflow">
                <span className="clickable" onClick={handleKeywordClick}>{song.artist}</span>
              </div>
              <div className="album dotOverflow">
                <span className="clickable" onClick={handleKeywordClick}>{song.album}</span>
              </div>
              <div className="duration dotOverflow">{song.duration}</div>
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
