import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import MusicList from "./MusicList";
import { setSearch, resetSearch } from '../helper/app';

function EntirePlaylist(props) {
  const { playing, priority, queue } = useSelector(store => store.socket);
  const { isSearching, searchingKeyword } = useSelector(store => store.app);
  const {
    setSearching,
    setSearchKeyword,
    searchPriority,
    searchQueue,
    requestQueueing
  } = props;

  return (
    <>
      <MusicList
        listTitle="now playing"
        customClassName="playing"
        musicArray={[playing]}
        searchSetters={{setSearching, setSearchKeyword}}
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
      { isSearching ? (
        <>
          <MusicList
            searching={true}
            listTitle="user queued list"
            customClassName="priority"
            musicArray={searchPriority}
            message="You can queue any music you want by double-clicking music!"
            searchSetters={{setSearching, setSearchKeyword}}
          />
          <MusicList
            searching={true}
            listTitle="next in queue"
            customClassName="queue"
            musicArray={searchQueue}
            handleDoubleClick={requestQueueing}
            searchSetters={{setSearching, setSearchKeyword}}
          />
        </>
      ) : (
        <>
          <MusicList
            listTitle="user queued list"
            customClassName="priority"
            musicArray={priority}
            message="You can queue any music you want by double-clicking music!"
            searchSetters={{setSearching, setSearchKeyword}}
          />
          <MusicList
            listTitle="next in queue"
            customClassName="queue"
            musicArray={queue}
            handleDoubleClick={requestQueueing}
            searchSetters={{setSearching, setSearchKeyword}}
          />
        </>
      )}
    </>
  );
}

export default EntirePlaylist;
