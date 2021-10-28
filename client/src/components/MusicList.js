import { useState, useEffect } from 'react';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import { filterMusicArrayByKeyword } from '../helper/music';
import Music from './Music';

function MusicList(props) {
  const { isSearching, searchingKeyword } = useSelector(store => store.app);
  const { customClassName, musicArray: originalMusicArray } = props;

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

  if (originalMusicArray.length === 0 || (isSearching && filteredMusicArray.length === 0)) {
    return <></>
  }

  return (
    <div className="musicList">
      <div className="columnIndicator">
        <div className="number">#</div>
        <div className="title">title</div>
        <div className="album">album</div>
        <div className="duration"><FontAwesomeIcon icon={faClock}/></div>
      </div>
      <div className={customClassName}>
        {/* branch by app is searching or not */}
        { !isSearching ? (
          musicArray.map((music, idx) => {
            return <Music key={idx} music={music}/>
          })
        ) : (
          filteredMusicArray.map((music, idx) => {
            return <Music key={idx} music={music}/>
          })
        )}
      </div>
    </div>
  );
}

export default MusicList;
