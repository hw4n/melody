import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import MusicList from "./MusicList";
import { setSearch, resetSearch } from '../helper/app';

function EntirePlaylist() {
  const { playing, priority, queue } = useSelector(store => store.socket);
  const { searchingKeyword } = useSelector(store => store.app);

  return (
    <>
      <MusicList
        listTitle="now playing"
        customClassName="playing"
        musicArray={[playing]}
      />
      <div className="search">
        <FontAwesomeIcon icon={faSearch}/>
        <input type="text" placeholder="Search for Title / Artist / Album" value={searchingKeyword} onInput={(e) => {
          const currentValue = e.target.value;
          if (currentValue.trim() === "") {
            resetSearch();
            return;
          }
          if (currentValue.length > 0) {
            setSearch(currentValue);
          } else {
            resetSearch();
          }
        }}/>
        { searchingKeyword.length ? (
          <FontAwesomeIcon icon={faTimes} onClick={resetSearch}/>
        ) : (
          <></>
        )}
      </div>
        <>
          <MusicList
            listTitle="user queued list"
            customClassName="priority"
            musicArray={priority}
            message="You can queue any music you want by double-clicking music!"
          />
          <MusicList
            listTitle="next in queue"
            customClassName="queue"
            musicArray={queue}
          />
        </>
    </>
  );
}

export default EntirePlaylist;
