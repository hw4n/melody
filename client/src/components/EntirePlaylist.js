import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MusicList from "./MusicList";

function EntirePlaylist(props) {
  const {
    playing,
    priority,
    queue,
    searching,
    setSearching,
    searchKeyword,
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
        <input type="text" placeholder="Search for Title / Artist / Album" value={searchKeyword} onInput={(e) => {
          const currentValue = e.target.value;
          if (currentValue.trim() === "") {
            setSearching(false);
            setSearchKeyword("");
            return;
          }
          if (currentValue.length > 0) {
            setSearching(true);
            setSearchKeyword(currentValue);
          } else {
            setSearching(false);
            setSearchKeyword("");
          }
        }}/>
        { searchKeyword.length ? (
          <FontAwesomeIcon icon={faTimes} onClick={(e) => {
            e.currentTarget.parentNode.querySelector("input").value = "";
            setSearching(false);
            setSearchKeyword("");
          }}/>
        ) : (
          <></>
        )}
      </div>
      { searching ? (
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
