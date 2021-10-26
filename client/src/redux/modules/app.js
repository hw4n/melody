const APP_SET_PLAYING = "APP/SET_PLAYING";
const APP_TOGGLE_PLAYING = "APP/TOGGLE_PLAYING";
const APP_SEARCH = "APP/SEARCH";
const APP_SET_LYRIC_MODE = "APP/SET_LYRIC_MODE";
const APP_TOGGLE_LYRIC_MODE = "APP/TOGGLE_LYRIC_MODE";
const APP_TOGGLE_MUTED = "APP/TOGGLE_MUTED";

const INIT_STATE = {
  isPlaying: false,
  isSearching: false,
  searchingKeyword: "",
  isLyricMode: false,
  isMuted: false,
}

export default function reducer(state = INIT_STATE, action) {
  switch (action.type) {
    case APP_SET_PLAYING:
      return {...state, isPlaying: action.setTo};
    case APP_TOGGLE_PLAYING:
      return {...state, isPlaying: !state.isPlaying};
    case APP_SEARCH:
      return {...state,
        isSearching: action.searchingKeyword.length > 0,
        searchingKeyword: action.searchingKeyword
      };
    case APP_SET_LYRIC_MODE:
      return {...state, isLyricMode: action.setTo};
    case APP_TOGGLE_LYRIC_MODE:
      return {...state, isLyricMode: !state.isLyricMode};
    case APP_TOGGLE_MUTED:
      return {...state, isMuted: !state.isMuted};
    default:
      return state;
  }
}
