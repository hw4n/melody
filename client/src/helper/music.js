import { secondsToTimestring } from "./format";

function getIndexByMusicId(array, musicId) {
  let foundIdx = -1;
  array.every((music, idx) => {
    if (music.id === musicId) {
      foundIdx = idx;
      return false;
    }
    return true;
  });
  return foundIdx;
}

export function enqueue(state, action) {
  const { priority, queue } = state;
  const { musicId } = action;

  const foundIdx = getIndexByMusicId(queue, musicId);
  const newQueue = [...queue];
  const foundMusic = newQueue.splice(foundIdx, 1)[0];

  return {...state,
    priority: [...priority, foundMusic],
    queue: newQueue,
  };
}

export function playNext(state, action) {
  const { playing, priority, queue } = state;
  const { FROM_QUEUE, start } = action.data;
  const newState = {...state, start};

  // current music is done
  const newQueue = [...queue, playing];
  let fromQueue; // what do we use to get next music?
  if (FROM_QUEUE === "priority") {
    fromQueue = [...priority];
  } else {
    fromQueue = newQueue;
  }

  // get and set first music from priority / queue array
  const newPlaying = fromQueue.splice(0, 1)[0];
  newState.playing = newPlaying;

  // set new priority / queue array
  if (FROM_QUEUE === "priority") {
    newState.priority = fromQueue;
    newState.queue = newQueue;
  } else {
    newState.queue = fromQueue;
  }

  return newState;
}

function stringToSearchString(string) {
  return string.replace(/\s/g, "").toLowerCase();
}

function musicHasSearchKeyword(music, searchKeyword) {
  // check emptiness
  if (Object.keys(music).length === 0) {
    return;
  }
  const keyword = stringToSearchString(searchKeyword);
  let { title, artist, album, romaji } = music;
  let { title: titleRomaji, artist: artistRomaji } = romaji;
  title = stringToSearchString(title);
  artist = stringToSearchString(artist);
  album = stringToSearchString(album);
  titleRomaji = stringToSearchString(titleRomaji);
  artistRomaji = stringToSearchString(artistRomaji);
  return (
    title.includes(keyword)
    || artist.includes(keyword)
    || album.includes(keyword)
    || titleRomaji.includes(keyword)
    || artistRomaji.includes(keyword)
  );
}

export function filterMusicArrayByKeyword(array, keyword) {
  return array.filter(music => musicHasSearchKeyword(music, keyword));
}

export function sortMusicsAsc(array) {
  return [...array].sort((a, b) => a.title[0].charCodeAt() - b.title[0].charCodeAt());
}

export function sortMusicsDesc(array) {
  return [...array].sort((a, b) => b.title[0].charCodeAt() - a.title[0].charCodeAt());
}

export function totalRuntime(array) {
  if (array.length) {
    const totalLength = array.reduce((acc, music) => {
      return acc + Number(music.duration);
    }, 0);
    return secondsToTimestring(totalLength);
  }
}
