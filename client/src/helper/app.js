import store, { socket } from '../redux/store';

export function setSearch(searchingKeyword) {
  store.dispatch({type: "APP/SEARCH", isSearching: true, searchingKeyword});
}

export function resetSearch() {
  store.dispatch({type: "APP/SEARCH", isSearching: false, searchingKeyword: ""});
}

export function setEditing(bool) {
  store.dispatch({type: "APP/SET_LYRIC_EDITING", setTo: bool});
}

export function setDocumentTitle(document, title) {
  document.title = title;
}

export function setMediaSession(window) {
  if ('mediaSession' in navigator) {
    const { playing, start } = store.getState().socket;
    const { title, artist, album } = playing;

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: title,
      artist: artist,
      album: album,
      artwork: [
        { src: `/96.png?${start}`,  sizes: '96x96',   type: 'image/png' },
        { src: `/128.png?${start}`, sizes: '128x128', type: 'image/png' },
        { src: `/192.png?${start}`, sizes: '192x192', type: 'image/png' },
        { src: `/256.png?${start}`, sizes: '256x256', type: 'image/png' },
        { src: `/384.png?${start}`, sizes: '384x384', type: 'image/png' },
        { src: `/512.png?${start}`, sizes: '512x512', type: 'image/png' },
      ]
    });

    const actionHandlers = [
      ['play',          () => {
        store.dispatch({type: "APP/TOGGLE_PLAYING"});
        navigator.mediaSession.playbackState = "playing";
      }],
      ['pause',         () => {
        store.dispatch({type: "APP/TOGGLE_PLAYING"});
        navigator.mediaSession.playbackState = "paused";
      }],
      ['previoustrack', () => { /* ... */ }],
      ['nexttrack',     () => { /* ... */ }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export function setKeydownListeners(document) {
  document.addEventListener("keydown", (e) => {
    // ignore keydown from inputs
    if (e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA") {
      return;
    }
    switch (e.key) {
      case " ":
        e.preventDefault();
        store.dispatch({type: "APP/TOGGLE_PLAYING"});
        break;
      case "m":
      case "M":
        store.dispatch({type: "APP/TOGGLE_MUTED"});
        break;
      case "l":
      case "L":
        store.dispatch({type: "APP/TOGGLE_LYRIC_MODE"});
        break;
      case "Escape":
        store.dispatch({type: "APP/SET_LYRIC_MODE", setTo: false});
        break;
      default:
        break;
    }
  });
}

// disconnect socket connection before unloading page
export function setUnloadEvent() {
  window.onbeforeunload = () => {
    socket.disconnect(true);
  };
}
