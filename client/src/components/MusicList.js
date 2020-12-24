import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function MusicList(props) {
  const { searching, listTitle, customClassName, musicArray, message, handleDoubleClick: parentHandleDoubleClick, searchSetters } = props;

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
        <div>title</div>
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
