import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from 'react-redux';
import MusicList from "./MusicList";
import { setSearch, resetSearch } from '../helper/app';
import Loader from './Loader';

function EntirePlaylist() {
  const { playing, priority, queue } = useSelector(store => store.socket);
  const { isSearching, searchingKeyword } = useSelector(store => store.app);

  if (!priority && !queue) {
    return <Loader/>
  } else {
  return (
    <div class="container">
      <MusicList
        listTitle="now playing"
        customClassName="playing"
        musicArray={[playing]}
      />
      <div className={"search " + (isSearching ? "searching" : "")}>
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
        <MusicList
          listTitle="user queued list"
          customClassName="priority"
          musicArray={priority}
        />
        <MusicList
          listTitle="next in queue"
          customClassName="queue"
          musicArray={queue}
        />
    </div>
  );
}}

export default EntirePlaylist;
