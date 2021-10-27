import { useState, useEffect } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import { filterMusicArrayByKeyword, sortMusicsAsc, sortMusicsDesc, totalRuntime } from '../helper/music';
import Music from './Music';

function MusicList(props) {
  const { isSearching, searchingKeyword } = useSelector(store => store.app);
  const { listTitle, customClassName, musicArray: originalMusicArray, message } = props;
  
  const [titleSort, setTitleSort] = useState(0);
  const [musicArray, setMusicArray] = useState([]);
  const [filteredMusicArray, setFilteredMusicArray] = useState([]);

  // set music array with original music array
  useEffect(() => {
    setMusicArray(originalMusicArray);
  }, [originalMusicArray]);

  useEffect(() => {
    // if not searching set back to originals
    if (!isSearching) {
      setMusicArray(originalMusicArray);
      setFilteredMusicArray([]);
      return;
    }
    // filter by keyword and set filtered array
    setFilteredMusicArray(filterMusicArrayByKeyword(originalMusicArray, searchingKeyword));
  }, [isSearching, originalMusicArray, searchingKeyword]);

  // in what order the musicArray should be displayed?
  useEffect(() => {
    if (titleSort === 0) {
      // set arrays back to originals
      setMusicArray(originalMusicArray);
      if (isSearching && searchingKeyword) {
        setFilteredMusicArray(filterMusicArrayByKeyword(originalMusicArray, searchingKeyword));
      }
    } else if (titleSort === 1) {
      setMusicArray(sortMusicsAsc);
      setFilteredMusicArray(sortMusicsAsc);
    } else {
      setMusicArray(sortMusicsDesc);
      setFilteredMusicArray(sortMusicsDesc);
    }
  }, [isSearching, originalMusicArray, searchingKeyword, titleSort]);

  if (originalMusicArray.length === 0 || (isSearching && filteredMusicArray.length === 0)) {
    return <></>
  }

  return (
    <div className="musicList">
      <div className="songListHeader divider">
      {isSearching ? (
        <>
          <h3><span className="searching">search result </span>{listTitle}</h3>
          <h3 className="searching">{filteredMusicArray.length} found</h3>
        </>
      ): (
        <>
          <h3>{listTitle}</h3>
          <h3>{totalRuntime(musicArray)}</h3>
        </>
      )}
      </div>
      <div className="columnIndicator divider">
        <div className="number">#</div>
        <div className="title">title</div>
        <div className="album">album</div>
        <div className="duration"><FontAwesomeIcon icon={faClock}/></div>
      </div>
      <div className={customClassName}>
        {/* branch by app is searching or not */}
        { !isSearching ? (
          musicArray.map(music => {
            return <Music music={music}/>
          })
        ) : (
          filteredMusicArray.map(music => {
            return <Music music={music}/>
          })
        )}
      </div>
    </div>
  );
}

export default MusicList;
