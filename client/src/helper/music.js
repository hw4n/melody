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
