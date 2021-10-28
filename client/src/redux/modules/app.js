import { loadState, saveState } from "../helper/localStorage";

const APP_SET_PLAYING = "APP/SET_PLAYING";
const APP_TOGGLE_PLAYING = "APP/TOGGLE_PLAYING";
const APP_SEARCH = "APP/SEARCH";
const APP_SET_CURRENT_MODE = "APP/SET_CURRENT_MODE";
const APP_SET_LYRIC_SCROLL_POSITION = "APP/SET_LYRIC_SCROLL_POSITION";
const APP_SET_LYRIC_EDITING = "APP/SET_LYRIC_EDITING";
const APP_TOGGLE_LYRIC_EDITING = "APP/TOGGLE_LYRIC_EDITING";
const APP_TOGGLE_MUTED = "APP/TOGGLE_MUTED";
const APP_SET_VOLUME = "APP/SET_VOLUME";
const APP_TOGGLE_LIGHT_THEME = "APP/TOGGLE_LIGHT_THEME";

const INIT_STATE = {
  isPlaying: false,
  isSearching: false,
  searchingKeyword: "",
  currentMode: 0,
  isMuted: false,
  lyricScrollPosition: 0,
  isEditingLyric: false,
  volume: 0.5,
  isLightTheme: false,
}

loadState(INIT_STATE);

export default function reducer(state = INIT_STATE, action) {
  let newState = {...state};
  switch (action.type) {
    case APP_SET_PLAYING:
       newState.isPlaying = action.setTo;
       break;

    case APP_TOGGLE_PLAYING:
      newState.isPlaying = !state.isPlaying;
      break;

    case APP_SEARCH:
      newState.isSearching = action.searchingKeyword.length > 0;
      newState.searchingKeyword = action.searchingKeyword;
      break;
    
    case APP_SET_CURRENT_MODE:
      newState.currentMode = action.setTo;
      break;

    case APP_SET_LYRIC_EDITING:
      newState.isEditingLyric = action.setTo;
      break;

    case APP_TOGGLE_LYRIC_EDITING:
      newState.isEditingLyric = !state.isEditingLyric;
      break;

    case APP_SET_LYRIC_SCROLL_POSITION:
      newState.lyricScrollPosition = action.position;
      break;

    case APP_SET_VOLUME:
      newState.volume = action.volume;
      break;

    case APP_TOGGLE_MUTED:
      newState.isMuted = !state.isMuted;
      break;

    case APP_TOGGLE_LIGHT_THEME:
      newState.isLightTheme = !state.isLightTheme;
      break;
    
    default:
      break;
  }
  saveState(newState);
  return newState;
}
